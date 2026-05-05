param(
    [string]$MarkdownPath = (Join-Path $PSScriptRoot 'project-methodology-planning.md'),
    [string]$OutputPath = (Join-Path $PSScriptRoot 'project-methodology-planning.xlsx')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Split-MarkdownRow {
    param([string]$Line)

    $trimmed = $Line.Trim()
    if ($trimmed.StartsWith('|')) {
        $trimmed = $trimmed.Substring(1)
    }

    if ($trimmed.EndsWith('|')) {
        $trimmed = $trimmed.Substring(0, $trimmed.Length - 1)
    }

    $cells = @()
    foreach ($cell in ($trimmed -split '\|')) {
        $cells += $cell.Trim()
    }

    return ,$cells
}

function Get-SectionLines {
    param(
        [string[]]$Lines,
        [string]$Heading
    )

    $headingIndex = [Array]::IndexOf($Lines, $Heading)
    if ($headingIndex -lt 0) {
        throw "Heading '$Heading' was not found in $MarkdownPath."
    }

    $startIndex = $headingIndex + 1
    $endIndex = $Lines.Length - 1

    for ($i = $startIndex; $i -lt $Lines.Length; $i++) {
        if ($i -gt $startIndex -and $Lines[$i] -match '^#{1,3}\s') {
            $endIndex = $i - 1
            break
        }
    }

    if ($startIndex -gt $endIndex) {
        return @()
    }

    return $Lines[$startIndex..$endIndex]
}

function Parse-MarkdownTable {
    param([string[]]$SectionLines)

    $tableLines = @()
    foreach ($line in $SectionLines) {
        if ($line.Trim().StartsWith('|')) {
            $tableLines += $line
        }
    }

    if ($tableLines.Count -lt 2) {
        throw 'No markdown table was found in the requested section.'
    }

    $headers = Split-MarkdownRow -Line $tableLines[0]
    $rows = @()

    for ($i = 2; $i -lt $tableLines.Count; $i++) {
        $rowValues = Split-MarkdownRow -Line $tableLines[$i]
        $rowObject = [ordered]@{}

        for ($columnIndex = 0; $columnIndex -lt $headers.Count; $columnIndex++) {
            $value = ''
            if ($columnIndex -lt $rowValues.Count) {
                $value = $rowValues[$columnIndex]
            }

            $rowObject[$headers[$columnIndex]] = $value
        }

        $rows += [pscustomobject]$rowObject
    }

    return [pscustomobject]@{
        Headers = $headers
        Rows    = $rows
    }
}

function Add-WorkingDays {
    param(
        [datetime]$StartDate,
        [int]$WorkingDaysToAdd
    )

    $date = $StartDate
    $remaining = $WorkingDaysToAdd

    while ($remaining -gt 0) {
        $date = $date.AddDays(1)
        if ($date.DayOfWeek -ne [System.DayOfWeek]::Saturday -and $date.DayOfWeek -ne [System.DayOfWeek]::Sunday) {
            $remaining--
        }
    }

    return $date
}

function Get-NextWorkingDay {
    param([datetime]$Date)

    return Add-WorkingDays -StartDate $Date -WorkingDaysToAdd 1
}

function Parse-GanttTasks {
    param([string[]]$SectionLines)

    $ownerDescriptions = @{
        BLUE   = 'Member A lead, supported by Member B'
        GREEN  = 'Member B lead, supported by Member A'
        ORANGE = 'Joint work across backend and frontend'
        PURPLE = 'Support work: training, testing, validation, and deployment'
    }

    $tasks = @()
    $taskSchedule = @{}
    $phase = ''

    foreach ($line in $SectionLines) {
        $trimmed = $line.Trim()
        if (-not $trimmed) {
            continue
        }

        if ($trimmed -eq '```mermaid' -or $trimmed -eq '```' -or $trimmed -match '^(gantt|title|dateFormat|axisFormat|excludes)\b') {
            continue
        }

        if ($trimmed -match '^section\s+(.+)$') {
            $phase = $Matches[1].Trim()
            continue
        }

        if ($trimmed -notmatch '^\[(?<color>[A-Z]+)\]\s*(?<task>.+?)\s+\((?<containers>C\d(?:-C\d)*)\)\s*:\s*(?<details>.+)$') {
            continue
        }

        $taskColor = $Matches['color']
        $taskName = $Matches['task'].Trim()
        $taskContainers = $Matches['containers']
        $taskDetails = $Matches['details']

        $details = @()
        foreach ($item in ($taskDetails -split ',')) {
            $details += $item.Trim()
        }

        if ($details.Count -lt 3) {
            throw "Unexpected gantt task format: $trimmed"
        }

        $durationToken = $details[$details.Count - 1]
        if ($durationToken -notmatch '^(?<days>\d+)d$') {
            throw "Unexpected duration token '$durationToken' in task: $trimmed"
        }

        $durationDays = [int]$Matches['days']
        $startToken = $details[$details.Count - 2]
        $taskId = $details[$details.Count - 3]
        $statusTags = 'planned'

        if ($details.Count -gt 3) {
            $statusTags = ($details[0..($details.Count - 4)] -join ', ')
        }

        $dependency = ''
        if ($startToken -match '^after\s+(?<taskRef>[A-Za-z0-9_-]+)$') {
            $dependency = $Matches['taskRef']
            if (-not $taskSchedule.ContainsKey($dependency)) {
                throw "Task dependency '$dependency' was not resolved before task '$taskId'."
            }

            $startDate = Get-NextWorkingDay -Date $taskSchedule[$dependency].EndDate
        }
        else {
            $startDate = [datetime]::ParseExact(
                $startToken,
                'yyyy-MM-dd',
                [System.Globalization.CultureInfo]::InvariantCulture
            )
        }

        $endDate = Add-WorkingDays -StartDate $startDate -WorkingDaysToAdd ($durationDays - 1)
        $taskSchedule[$taskId] = [pscustomobject]@{
            StartDate = $startDate
            EndDate   = $endDate
        }

        $ownerCode = $taskColor
        $containers = (($taskContainers -split '-') -join ', ')

        $tasks += [pscustomobject][ordered]@{
            Phase              = $phase
            Task               = $taskName
            OwnerCode          = $ownerCode
            TeamAllocation     = $ownerDescriptions[$ownerCode]
            Containers         = $containers
            StartDate          = $startDate
            EndDate            = $endDate
            DurationWorkingDays = $durationDays
            Dependency         = $dependency
            Status             = $statusTags
            TaskId             = $taskId
        }
    }

    return $tasks
}

function Escape-XmlText {
    param([string]$Text)

    if ($null -eq $Text) {
        return ''
    }

    return [System.Security.SecurityElement]::Escape($Text)
}

function Get-ExcelColumnName {
    param([int]$ColumnNumber)

    $name = ''
    $current = $ColumnNumber

    while ($current -gt 0) {
        $remainder = [int](($current - 1) % 26)
        $name = [char]([int](65 + $remainder)) + $name
        $current = [int][math]::Floor(($current - 1) / 26)
    }

    return $name
}

function Get-CellXml {
    param(
        [string]$CellReference,
        $Value
    )

    if ($null -eq $Value -or "$Value" -eq '') {
        return ''
    }

    if (
        $Value -is [byte] -or
        $Value -is [int16] -or
        $Value -is [int32] -or
        $Value -is [int64] -or
        $Value -is [single] -or
        $Value -is [double] -or
        $Value -is [decimal]
    ) {
        return "<c r=""$CellReference""><v>$Value</v></c>"
    }

    $text = Escape-XmlText -Text ([string]$Value)
    return "<c r=""$CellReference"" t=""inlineStr""><is><t xml:space=""preserve"">$text</t></is></c>"
}

function Convert-ObjectsToWorksheetRows {
    param(
        [string[]]$Headers,
        [object[]]$Rows,
        [string[]]$PropertyOrder
    )

    $worksheetRows = @()
    $worksheetRows += ,$Headers

    foreach ($row in $Rows) {
        $values = @()
        foreach ($propertyName in $PropertyOrder) {
            $value = $row.PSObject.Properties[$propertyName].Value
            if ($value -is [datetime]) {
                $values += $value.ToString('dd/MM/yyyy')
            }
            else {
                $values += $value
            }
        }

        $worksheetRows += ,$values
    }

    return $worksheetRows
}

function Get-WorkingDatesInRange {
    param([object[]]$Tasks)

    $startDate = ($Tasks | Measure-Object -Property StartDate -Minimum).Minimum
    $endDate = ($Tasks | Measure-Object -Property EndDate -Maximum).Maximum

    $dates = @()
    $current = $startDate
    while ($current -le $endDate) {
        if ($current.DayOfWeek -ne [System.DayOfWeek]::Saturday -and $current.DayOfWeek -ne [System.DayOfWeek]::Sunday) {
            $dates += $current
        }

        $current = $current.AddDays(1)
    }

    return $dates
}

function Convert-TasksToTimelineRows {
    param([object[]]$Tasks)

    $workingDates = Get-WorkingDatesInRange -Tasks $Tasks
    $headerRow = @('Phase', 'Task', 'Owner', 'Containers')
    foreach ($workingDate in $workingDates) {
        $headerRow += $workingDate.ToString('dd/MM ddd')
    }

    $rows = @()
    $rows += ,$headerRow

    foreach ($task in $Tasks) {
        $taskRow = @(
            $task.Phase,
            $task.Task,
            $task.OwnerCode,
            $task.Containers
        )

        foreach ($workingDate in $workingDates) {
            if ($workingDate -ge $task.StartDate -and $workingDate -le $task.EndDate) {
                $taskRow += 'X'
            }
            else {
                $taskRow += ''
            }
        }

        $rows += ,$taskRow
    }

    $rows += ,@('')
    $rows += ,@('Legend')
    $rows += ,@('Code', 'Meaning')
    foreach ($legendRow in (Get-TimelineLegendRows | Select-Object -Skip 3)) {
        $rows += ,$legendRow
    }

    return [pscustomobject]@{
        Rows = $rows
        WorkingDateCount = $workingDates.Count
    }
}

function Get-TimelineLegendRows {
    return @(
        @(''),
        @('Legend'),
        @('Code', 'Meaning'),
        @('BLUE', 'Member A lead, supported by Member B'),
        @('GREEN', 'Member B lead, supported by Member A'),
        @('ORANGE', 'Joint work across backend and frontend'),
        @('PURPLE', 'Support work: training, testing, validation, and deployment'),
        @('C1', 'PostgreSQL container'),
        @('C2', 'pgAdmin container'),
        @('C3', 'Backend API container'),
        @('C4', 'Frontend web container')
    )
}

function Get-WorksheetXml {
    param(
        [object[]]$Rows,
        [int]$FrozenRows = 1,
        [string]$AutoFilterRange = ''
    )

    $sheetBuilder = New-Object System.Text.StringBuilder
    [void]$sheetBuilder.AppendLine('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    [void]$sheetBuilder.AppendLine('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')

    if ($FrozenRows -gt 0) {
        $topLeftCell = "A$($FrozenRows + 1)"
        [void]$sheetBuilder.AppendLine('  <sheetViews>')
        [void]$sheetBuilder.AppendLine('    <sheetView workbookViewId="0">')
        [void]$sheetBuilder.AppendLine("      <pane ySplit=""$FrozenRows"" topLeftCell=""$topLeftCell"" activePane=""bottomLeft"" state=""frozen""/>")
        [void]$sheetBuilder.AppendLine('    </sheetView>')
        [void]$sheetBuilder.AppendLine('  </sheetViews>')
    }

    [void]$sheetBuilder.AppendLine('  <sheetData>')

    $rowNumber = 1
    foreach ($row in $Rows) {
        [void]$sheetBuilder.AppendLine("    <row r=""$rowNumber"">")

        for ($columnIndex = 0; $columnIndex -lt $row.Count; $columnIndex++) {
            $cellReference = "$(Get-ExcelColumnName -ColumnNumber ($columnIndex + 1))$rowNumber"
            $cellXml = Get-CellXml -CellReference $cellReference -Value $row[$columnIndex]
            if ($cellXml) {
                [void]$sheetBuilder.AppendLine("      $cellXml")
            }
        }

        [void]$sheetBuilder.AppendLine('    </row>')
        $rowNumber++
    }

    [void]$sheetBuilder.AppendLine('  </sheetData>')

    if ($AutoFilterRange) {
        [void]$sheetBuilder.AppendLine("  <autoFilter ref=""$AutoFilterRange""/>")
    }

    [void]$sheetBuilder.AppendLine('</worksheet>')
    return $sheetBuilder.ToString()
}

function Write-Utf8File {
    param(
        [string]$Path,
        [string]$Content
    )

    [System.IO.File]::WriteAllText(
        $Path,
        $Content,
        (New-Object System.Text.UTF8Encoding($false))
    )
}

function Write-XlsxPackage {
    param(
        [string]$DestinationPath,
        [object[]]$Sheets
    )

    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("xlsx-export-" + [guid]::NewGuid().ToString('N'))
    $null = New-Item -ItemType Directory -Path $tempRoot
    $null = New-Item -ItemType Directory -Path (Join-Path $tempRoot '_rels')
    $null = New-Item -ItemType Directory -Path (Join-Path $tempRoot 'docProps')
    $null = New-Item -ItemType Directory -Path (Join-Path $tempRoot 'xl')
    $null = New-Item -ItemType Directory -Path (Join-Path $tempRoot 'xl\\_rels')
    $null = New-Item -ItemType Directory -Path (Join-Path $tempRoot 'xl\\worksheets')

    try {
        $contentTypesBuilder = New-Object System.Text.StringBuilder
        [void]$contentTypesBuilder.AppendLine('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
        [void]$contentTypesBuilder.AppendLine('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">')
        [void]$contentTypesBuilder.AppendLine('  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>')
        [void]$contentTypesBuilder.AppendLine('  <Default Extension="xml" ContentType="application/xml"/>')
        [void]$contentTypesBuilder.AppendLine('  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>')
        [void]$contentTypesBuilder.AppendLine('  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>')
        [void]$contentTypesBuilder.AppendLine('  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>')

        $workbookBuilder = New-Object System.Text.StringBuilder
        [void]$workbookBuilder.AppendLine('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
        [void]$workbookBuilder.AppendLine('<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">')
        [void]$workbookBuilder.AppendLine('  <bookViews>')
        [void]$workbookBuilder.AppendLine('    <workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/>')
        [void]$workbookBuilder.AppendLine('  </bookViews>')
        [void]$workbookBuilder.AppendLine('  <sheets>')

        $workbookRelsBuilder = New-Object System.Text.StringBuilder
        [void]$workbookRelsBuilder.AppendLine('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
        [void]$workbookRelsBuilder.AppendLine('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">')

        for ($sheetIndex = 0; $sheetIndex -lt $Sheets.Count; $sheetIndex++) {
            $sheet = $Sheets[$sheetIndex]
            $sheetNumber = $sheetIndex + 1
            $sheetPath = Join-Path $tempRoot "xl\\worksheets\\sheet$sheetNumber.xml"

            $frozenRows = 1
            if ($sheet.PSObject.Properties.Name -contains 'FrozenRows' -and $sheet.FrozenRows) {
                $frozenRows = [int]$sheet.FrozenRows
            }

            Write-Utf8File -Path $sheetPath -Content (Get-WorksheetXml -Rows $sheet.Rows -FrozenRows $frozenRows -AutoFilterRange $sheet.AutoFilterRange)

            [void]$contentTypesBuilder.AppendLine("  <Override PartName=""/xl/worksheets/sheet$sheetNumber.xml"" ContentType=""application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml""/>")
            [void]$workbookBuilder.AppendLine("    <sheet name=""$(Escape-XmlText -Text $sheet.Name)"" sheetId=""$sheetNumber"" r:id=""rId$sheetNumber""/>")
            [void]$workbookRelsBuilder.AppendLine("  <Relationship Id=""rId$sheetNumber"" Type=""http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"" Target=""worksheets/sheet$sheetNumber.xml""/>")
        }

        [void]$contentTypesBuilder.AppendLine('</Types>')
        [void]$workbookBuilder.AppendLine('  </sheets>')
        [void]$workbookBuilder.AppendLine('</workbook>')
        [void]$workbookRelsBuilder.AppendLine('</Relationships>')

        Write-Utf8File -Path (Join-Path $tempRoot '[Content_Types].xml') -Content $contentTypesBuilder.ToString()

        Write-Utf8File -Path (Join-Path $tempRoot '_rels\\.rels') -Content @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

        Write-Utf8File -Path (Join-Path $tempRoot 'xl\\workbook.xml') -Content $workbookBuilder.ToString()
        Write-Utf8File -Path (Join-Path $tempRoot 'xl\\_rels\\workbook.xml.rels') -Content $workbookRelsBuilder.ToString()

        $timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
        Write-Utf8File -Path (Join-Path $tempRoot 'docProps\\core.xml') -Content @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Project Methodology Planning</dc:title>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$timestamp</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$timestamp</dcterms:modified>
</cp:coreProperties>
"@

        Write-Utf8File -Path (Join-Path $tempRoot 'docProps\\app.xml') -Content @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
  <Sheets>$($Sheets.Count)</Sheets>
</Properties>
"@

        $destinationDirectory = Split-Path -Path $DestinationPath -Parent
        if (-not (Test-Path -LiteralPath $destinationDirectory)) {
            $null = New-Item -ItemType Directory -Path $destinationDirectory
        }

        if (Test-Path -LiteralPath $DestinationPath) {
            Remove-Item -LiteralPath $DestinationPath -Force
        }

        [System.IO.Compression.ZipFile]::CreateFromDirectory($tempRoot, $DestinationPath)
    }
    finally {
        if (Test-Path -LiteralPath $tempRoot) {
            Remove-Item -LiteralPath $tempRoot -Recurse -Force
        }
    }
}

if (-not (Test-Path -LiteralPath $MarkdownPath)) {
    throw "Markdown file not found: $MarkdownPath"
}

$markdownLines = Get-Content -LiteralPath $MarkdownPath
$timelineLines = Get-SectionLines -Lines $markdownLines -Heading '### Figure: Project Timeline by Sprint, Container, and Team Allocation'
$sprintSummaryLines = Get-SectionLines -Lines $markdownLines -Heading '### Sprint Summary'
$backlogLines = Get-SectionLines -Lines $markdownLines -Heading '### Prioritized Product Backlog Grouped by Sprint'

$timelineRows = Parse-GanttTasks -SectionLines $timelineLines
$sprintSummaryTable = Parse-MarkdownTable -SectionLines $sprintSummaryLines
$backlogTable = Parse-MarkdownTable -SectionLines $backlogLines

foreach ($sprintSummaryRow in $sprintSummaryTable.Rows) {
    if ($sprintSummaryRow.Duration -match '^(?<days>\d+)\s+days$') {
        $sprintSummaryRow.Duration = [int]$Matches['days']
    }
}

foreach ($backlogRow in $backlogTable.Rows) {
    if ($backlogRow.Sprint -match '^\d+$') {
        $backlogRow.Sprint = [int]$backlogRow.Sprint
    }

    if ($backlogRow.Priority -match '^\d+$') {
        $backlogRow.Priority = [int]$backlogRow.Priority
    }
}

$timelineSheet = Convert-TasksToTimelineRows -Tasks $timelineRows

$sprintSummarySheetRows = Convert-ObjectsToWorksheetRows `
    -Headers $sprintSummaryTable.Headers `
    -Rows $sprintSummaryTable.Rows `
    -PropertyOrder $sprintSummaryTable.Headers

$backlogSheetRows = Convert-ObjectsToWorksheetRows `
    -Headers $backlogTable.Headers `
    -Rows $backlogTable.Rows `
    -PropertyOrder $backlogTable.Headers

$sprintSummaryAutoFilterRange = "A1:$(Get-ExcelColumnName -ColumnNumber $sprintSummaryTable.Headers.Count)$($sprintSummaryTable.Rows.Count + 1)"
$backlogAutoFilterRange = "A1:$(Get-ExcelColumnName -ColumnNumber $backlogTable.Headers.Count)$($backlogTable.Rows.Count + 1)"

$sheets = @(
    [pscustomobject]@{
        Name            = 'Timeline'
        Rows            = $timelineSheet.Rows
        AutoFilterRange = ''
        FrozenRows      = 1
    },
    [pscustomobject]@{
        Name            = 'Sprint Summary'
        Rows            = $sprintSummarySheetRows
        AutoFilterRange = $sprintSummaryAutoFilterRange
    },
    [pscustomobject]@{
        Name            = 'Product Backlog'
        Rows            = $backlogSheetRows
        AutoFilterRange = $backlogAutoFilterRange
    }
)

Write-XlsxPackage -DestinationPath $OutputPath -Sheets $sheets
Write-Output "Excel workbook created: $OutputPath"
