$ErrorActionPreference = 'Stop'

$markdownPath = Join-Path $PSScriptRoot 'project-methodology-planning.md'
$outputPath = Join-Path $PSScriptRoot 'project-methodology-planning-table.docx'
$tempRoot = Join-Path $PSScriptRoot ('.word-export-' + [guid]::NewGuid().ToString())

if (-not (Test-Path -LiteralPath $markdownPath)) {
    throw "Markdown file not found: $markdownPath"
}

function Escape-Xml {
    param([string]$Text)

    if ($null -eq $Text) {
        return ''
    }

    return $Text.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;').Replace("'", '&apos;')
}

function New-Run {
    param(
        [string]$Text,
        [int]$Size,
        [string]$Color = '000000',
        [switch]$Bold
    )

    $escaped = Escape-Xml $Text
    $boldXml = if ($Bold) { '<w:b/>' } else { '' }

    return @"
<w:r>
  <w:rPr>
    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
    $boldXml
    <w:color w:val="$Color"/>
    <w:sz w:val="$Size"/>
    <w:szCs w:val="$Size"/>
  </w:rPr>
  <w:t xml:space="preserve">$escaped</w:t>
</w:r>
"@
}

function New-Paragraph {
    param(
        [string]$Text,
        [string]$Align = 'left',
        [int]$Size = 20,
        [string]$Color = '000000',
        [switch]$Bold,
        [int]$SpacingAfter = 0
    )

    $runXml = New-Run -Text $Text -Size $Size -Color $Color -Bold:$Bold

    return @"
<w:p>
  <w:pPr>
    <w:jc w:val="$Align"/>
    <w:spacing w:after="$SpacingAfter"/>
  </w:pPr>
  $runXml
</w:p>
"@
}

function New-TableCell {
    param(
        [string]$Text,
        [int]$Width,
        [string]$Fill,
        [string]$Align = 'left',
        [int]$Size = 20,
        [string]$Color = '000000',
        [switch]$Bold
    )

    $runXml = New-Run -Text $Text -Size $Size -Color $Color -Bold:$Bold

    return @"
<w:tc>
  <w:tcPr>
    <w:tcW w:w="$Width" w:type="dxa"/>
    <w:shd w:val="clear" w:color="auto" w:fill="$Fill"/>
    <w:vAlign w:val="center"/>
  </w:tcPr>
  <w:p>
    <w:pPr>
      <w:jc w:val="$Align"/>
      <w:spacing w:after="0"/>
    </w:pPr>
    $runXml
  </w:p>
</w:tc>
"@
}

function New-TableRow {
    param(
        [string[]]$Cells,
        [string]$Fill,
        [int[]]$Widths = @(1000, 8200, 1200, 2200, 1600),
        [string[]]$Alignments = @('center', 'left', 'center', 'left', 'center'),
        [switch]$Header
    )

    $textColor = if ($Header) { 'FFFFFF' } else { '000000' }
    $size = if ($Header) { 20 } else { 19 }

    $rowCells = for ($index = 0; $index -lt $Cells.Count; $index++) {
        New-TableCell -Text $Cells[$index] -Width $Widths[$index] -Fill $Fill -Align $Alignments[$index] -Size $size -Color $textColor -Bold:$Header
    }

    $rowProps = if ($Header) { '<w:trPr><w:tblHeader/></w:trPr>' } else { '' }

    return @"
<w:tr>
  $rowProps
  $($rowCells -join "`n")
</w:tr>
"@
}

function New-TableXml {
    param(
        [string[]]$Headers,
        [object[]]$Rows,
        [int[]]$Widths,
        [string[]]$Alignments,
        [string[]]$RowFills
    )

    $gridXml = ($Widths | ForEach-Object { "<w:gridCol w:w=`"$_`"/>" }) -join "`n        "

    $bodyRows = for ($rowIndex = 0; $rowIndex -lt $Rows.Count; $rowIndex++) {
        $fill = if ($RowFills -and $rowIndex -lt $RowFills.Count -and $RowFills[$rowIndex]) {
            $RowFills[$rowIndex]
        }
        elseif ($rowIndex % 2 -eq 0) {
            'F2F6FB'
        }
        else {
            'FFFFFF'
        }

        New-TableRow -Cells $Rows[$rowIndex] -Fill $fill -Widths $Widths -Alignments $Alignments
    }

    return @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:space="0" w:color="1F4E79"/>
      <w:left w:val="single" w:sz="8" w:space="0" w:color="1F4E79"/>
      <w:bottom w:val="single" w:sz="8" w:space="0" w:color="1F4E79"/>
      <w:right w:val="single" w:sz="8" w:space="0" w:color="1F4E79"/>
      <w:insideH w:val="single" w:sz="6" w:space="0" w:color="A9BDD0"/>
      <w:insideV w:val="single" w:sz="6" w:space="0" w:color="A9BDD0"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    $gridXml
  </w:tblGrid>
  $(New-TableRow -Cells $Headers -Fill '1F4E79' -Widths $Widths -Alignments $Alignments -Header)
  $($bodyRows -join "`n")
</w:tbl>
"@
}

function Get-MarkdownTableRows {
    param(
        [string[]]$Lines,
        [string]$HeaderLine,
        [string]$TableName
    )

    $tableStart = $Lines.IndexOf($HeaderLine)
    if ($tableStart -lt 0) {
        throw "Could not find the $TableName header in the markdown file."
    }

    $rows = @()
    for ($i = $tableStart + 2; $i -lt $Lines.Count; $i++) {
        $line = $Lines[$i].Trim()
        if (-not $line.StartsWith('|')) {
            break
        }

        $parts = $line.Split('|') | ForEach-Object { $_.Trim() }
        if ($parts.Count -ge 4) {
            $rows += ,@($parts[1..($parts.Count - 2)])
        }
    }

    if ($rows.Count -eq 0) {
        throw "No data rows were parsed from the $TableName table."
    }

    return $rows
}

$lines = Get-Content -LiteralPath $markdownPath
$sprintSummaryHeaderLine = '| Sprint | Main objective | Duration | Dates | Main containers involved |'
$backlogHeaderLine = '| Sprint | Product backlog item / user story | Priority | Main containers | Owner |'

$sprintSummaryRows = Get-MarkdownTableRows -Lines $lines -HeaderLine $sprintSummaryHeaderLine -TableName 'sprint summary'
$backlogRows = Get-MarkdownTableRows -Lines $lines -HeaderLine $backlogHeaderLine -TableName 'product backlog'

$summaryRowFills = foreach ($row in $sprintSummaryRows) {
    switch ($row[0]) {
        'Formation' { 'FFF2CC' }
        'Sprint 1'  { 'E2F0D9' }
        'Sprint 2'  { 'D9EAF7' }
        'Sprint 3'  { 'E4D9F7' }
        default     { 'F2F6FB' }
    }
}

$utcNow = [DateTime]::UtcNow.ToString('s') + 'Z'
$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
            xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
            xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
            xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
            xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
            mc:Ignorable="w14 wp14">
  <w:body>
    $(New-Paragraph -Text 'E-Commerce Project Planning' -Align 'left' -Size 32 -Color '1F4E79' -Bold -SpacingAfter 80)
    $(New-Paragraph -Text 'Formation phase, sprint summary, and prioritized backlog exported from Markdown' -Align 'left' -Size 20 -Color '4F81BD' -SpacingAfter 80)
    $(New-Paragraph -Text 'Timeline from 02 Feb 2026 to 21 May 2026 (weekends excluded)' -Align 'left' -Size 18 -Color '666666' -SpacingAfter 140)
    $(New-Paragraph -Text 'Sprint Timeline Overview' -Align 'left' -Size 24 -Color '1F4E79' -Bold -SpacingAfter 70)
    $(New-TableXml -Headers @('Sprint', 'Main objective', 'Duration', 'Dates', 'Main containers involved') -Rows $sprintSummaryRows -Widths @(1500, 4700, 1300, 2900, 2100) -Alignments @('center', 'left', 'center', 'center', 'left') -RowFills $summaryRowFills)
    $(New-Paragraph -Text '' -SpacingAfter 120)
    $(New-Paragraph -Text 'Prioritized Product Backlog' -Align 'left' -Size 24 -Color '1F4E79' -Bold -SpacingAfter 70)
    $(New-TableXml -Headers @('Sprint', 'Product backlog item / user story', 'Priority', 'Main containers', 'Owner') -Rows $backlogRows -Widths @(1000, 8200, 1200, 2200, 1600) -Alignments @('center', 'left', 'center', 'left', 'center') -RowFills @())
    <w:sectPr>
      <w:pgSz w:w="15840" w:h="12240" w:orient="landscape"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="450" w:footer="450" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$contentTypesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"@

$relsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Project Methodology Planning</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$utcNow</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$utcNow</dcterms:modified>
</cp:coreProperties>
"@

$appXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
            xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Title</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="1" baseType="lpstr">
      <vt:lpstr>Project Methodology Planning</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company>OpenAI</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$finalOutputPath = $outputPath

try {
    New-Item -ItemType Directory -Path $tempRoot | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempRoot '_rels') | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempRoot 'docProps') | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempRoot 'word') | Out-Null

    [System.IO.File]::WriteAllText((Join-Path $tempRoot '[Content_Types].xml'), $contentTypesXml, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempRoot '_rels\.rels'), $relsXml, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'docProps\core.xml'), $coreXml, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'docProps\app.xml'), $appXml, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'word\document.xml'), $documentXml, $utf8NoBom)

    Add-Type -AssemblyName System.IO.Compression.FileSystem

    if (Test-Path -LiteralPath $outputPath) {
        try {
            Remove-Item -LiteralPath $outputPath -Force
        }
        catch {
            $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
            $finalOutputPath = Join-Path $PSScriptRoot ("project-methodology-planning-table-$timestamp.docx")
        }
    }

    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempRoot, $finalOutputPath)
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
        Start-Sleep -Milliseconds 200

        try {
            Remove-Item -LiteralPath $tempRoot -Recurse -Force
        }
        catch {
            # Ignore transient Windows file locks in the temp workspace.
        }
    }
}

Write-Output "Created $finalOutputPath"
