param(
    [string]$MarkdownPath = (Join-Path $PSScriptRoot 'rapport-sprint-ecommerce.md'),
    [string]$OutputPath = (Join-Path $PSScriptRoot 'rapport-sprint-ecommerce.docx')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $MarkdownPath)) {
    throw "Markdown file not found: $MarkdownPath"
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

$tempRoot = Join-Path $PSScriptRoot ('.word-export-sprint-' + [guid]::NewGuid().ToString())
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$script:ImageCounter = 1
$script:DrawingCounter = 1
$script:ImageRegistry = New-Object System.Collections.Generic.List[object]

function Escape-Xml {
    param([string]$Text)

    if ($null -eq $Text) {
        return ''
    }

    return $Text.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;').Replace("'", '&apos;')
}

function New-RunXml {
    param(
        [string]$Text,
        [int]$Size = 22,
        [string]$Color = '000000',
        [string]$Font = 'Calibri',
        [switch]$Bold,
        [switch]$Italic
    )

    $escaped = Escape-Xml $Text
    $boldXml = if ($Bold) { '<w:b/>' } else { '' }
    $italicXml = if ($Italic) { '<w:i/>' } else { '' }

    return @"
<w:r>
  <w:rPr>
    <w:rFonts w:ascii="$Font" w:hAnsi="$Font" w:cs="$Font"/>
    $boldXml
    $italicXml
    <w:color w:val="$Color"/>
    <w:sz w:val="$Size"/>
    <w:szCs w:val="$Size"/>
  </w:rPr>
  <w:t xml:space="preserve">$escaped</w:t>
</w:r>
"@
}

function Convert-InlineMarkdownToRunsXml {
    param(
        [string]$Text,
        [int]$Size = 22,
        [string]$Color = '000000',
        [string]$Font = 'Calibri',
        [switch]$Bold,
        [switch]$Italic
    )

    if ($null -eq $Text) {
        $Text = ''
    }

    $parts = [regex]::Split($Text, '(\*\*.*?\*\*)')
    $runs = foreach ($part in $parts) {
        if ([string]::IsNullOrEmpty($part)) {
            continue
        }

        if ($part.StartsWith('**') -and $part.EndsWith('**') -and $part.Length -ge 4) {
            $content = $part.Substring(2, $part.Length - 4)
            New-RunXml -Text $content -Size $Size -Color $Color -Font $Font -Bold -Italic:$Italic
        }
        else {
            New-RunXml -Text $part -Size $Size -Color $Color -Font $Font -Bold:$Bold -Italic:$Italic
        }
    }

    return ($runs -join "`n")
}

function New-ParagraphXml {
    param(
        [string]$RunsXml,
        [string]$Align = 'left',
        [int]$SpacingBefore = 0,
        [int]$SpacingAfter = 80,
        [int]$IndentLeft = 0,
        [int]$Hanging = 0
    )

    $indentXml = if ($IndentLeft -gt 0 -or $Hanging -gt 0) {
        "<w:ind w:left=`"$IndentLeft`" w:hanging=`"$Hanging`"/>"
    }
    else {
        ''
    }

    return @"
<w:p>
  <w:pPr>
    <w:jc w:val="$Align"/>
    <w:spacing w:before="$SpacingBefore" w:after="$SpacingAfter"/>
    $indentXml
  </w:pPr>
  $RunsXml
</w:p>
"@
}

function New-TextParagraph {
    param(
        [string]$Text,
        [string]$Align = 'left',
        [int]$Size = 22,
        [string]$Color = '000000',
        [string]$Font = 'Calibri',
        [switch]$Bold,
        [switch]$Italic,
        [int]$SpacingBefore = 0,
        [int]$SpacingAfter = 80,
        [int]$IndentLeft = 0,
        [int]$Hanging = 0
    )

    $runs = Convert-InlineMarkdownToRunsXml -Text $Text -Size $Size -Color $Color -Font $Font -Bold:$Bold -Italic:$Italic
    return New-ParagraphXml -RunsXml $runs -Align $Align -SpacingBefore $SpacingBefore -SpacingAfter $SpacingAfter -IndentLeft $IndentLeft -Hanging $Hanging
}

function New-PageBreakXml {
    return @"
<w:p>
  <w:r>
    <w:br w:type="page"/>
  </w:r>
</w:p>
"@
}

function New-SectionBanner {
    param([string]$Text)

    $runXml = New-RunXml -Text $Text -Size 26 -Color 'FFFFFF' -Bold

    return @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="10000" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="0" w:color="1F4E79"/>
      <w:left w:val="single" w:sz="0" w:color="1F4E79"/>
      <w:bottom w:val="single" w:sz="0" w:color="1F4E79"/>
      <w:right w:val="single" w:sz="0" w:color="1F4E79"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="10000"/>
  </w:tblGrid>
  <w:tr>
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="10000" w:type="dxa"/>
        <w:shd w:val="clear" w:color="auto" w:fill="1F4E79"/>
      </w:tcPr>
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:before="60" w:after="60"/>
        </w:pPr>
        $runXml
      </w:p>
    </w:tc>
  </w:tr>
</w:tbl>
"@
}

function New-HeadingParagraph {
    param(
        [string]$Text,
        [int]$Level
    )

    switch ($Level) {
        3 { return (New-TextParagraph -Text $Text -Size 24 -Color '1F4E79' -Bold -SpacingBefore 40 -SpacingAfter 60) }
        4 { return (New-TextParagraph -Text $Text -Size 22 -Color 'C55A11' -Bold -SpacingBefore 30 -SpacingAfter 40) }
        default { return (New-TextParagraph -Text $Text -Size 24 -Color '1F4E79' -Bold -SpacingBefore 40 -SpacingAfter 60) }
    }
}

function New-CaptionParagraph {
    param([string]$Text)

    return New-TextParagraph -Text $Text -Align 'center' -Size 18 -Color '5B6572' -Bold -Italic -SpacingBefore 20 -SpacingAfter 40
}

function New-CalloutBox {
    param(
        [string]$Text,
        [string]$Fill = 'F7F9FC',
        [string]$Border = 'B8C4CE'
    )

    $paragraph = New-TextParagraph -Text $Text -Align 'center' -Size 18 -Color '4B5563' -Italic -SpacingAfter 0

    return @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="10000" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:space="0" w:color="$Border"/>
      <w:left w:val="single" w:sz="8" w:space="0" w:color="$Border"/>
      <w:bottom w:val="single" w:sz="8" w:space="0" w:color="$Border"/>
      <w:right w:val="single" w:sz="8" w:space="0" w:color="$Border"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="10000"/>
  </w:tblGrid>
  <w:tr>
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="10000" w:type="dxa"/>
        <w:shd w:val="clear" w:color="auto" w:fill="$Fill"/>
      </w:tcPr>
      $paragraph
    </w:tc>
  </w:tr>
</w:tbl>
"@
}

function New-CodeBox {
    param([string[]]$Lines)

    $codeParagraphs = foreach ($line in $Lines) {
        $run = New-RunXml -Text $line -Size 16 -Color '374151' -Font 'Consolas'
        New-ParagraphXml -RunsXml $run -Align 'left' -SpacingAfter 0
    }

    return @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="10000" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="6" w:space="0" w:color="D1D5DB"/>
      <w:left w:val="single" w:sz="6" w:space="0" w:color="D1D5DB"/>
      <w:bottom w:val="single" w:sz="6" w:space="0" w:color="D1D5DB"/>
      <w:right w:val="single" w:sz="6" w:space="0" w:color="D1D5DB"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="10000"/>
  </w:tblGrid>
  <w:tr>
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="10000" w:type="dxa"/>
        <w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/>
      </w:tcPr>
      $($codeParagraphs -join "`n")
    </w:tc>
  </w:tr>
</w:tbl>
"@
}

function New-TableCellXml {
    param(
        [string]$Text,
        [int]$Width,
        [string]$Fill,
        [string]$Align,
        [int]$Size,
        [string]$Color,
        [switch]$Bold
    )

    $paragraph = New-TextParagraph -Text $Text -Align $Align -Size $Size -Color $Color -Bold:$Bold -SpacingAfter 0

    return @"
<w:tc>
  <w:tcPr>
    <w:tcW w:w="$Width" w:type="dxa"/>
    <w:shd w:val="clear" w:color="auto" w:fill="$Fill"/>
    <w:vAlign w:val="center"/>
  </w:tcPr>
  $paragraph
</w:tc>
"@
}

function Get-ColumnWidths {
    param(
        [string[]]$Headers,
        [object[]]$Rows,
        [int]$TotalWidth = 10000
    )

    $columnCount = $Headers.Count
    $weights = New-Object int[] $columnCount

    for ($i = 0; $i -lt $columnCount; $i++) {
        $maxLength = [Math]::Max(12, $Headers[$i].Length)
        foreach ($row in $Rows) {
            if ($i -lt $row.Count) {
                $maxLength = [Math]::Max($maxLength, ([string]$row[$i]).Length)
            }
        }
        $weights[$i] = $maxLength
    }

    $weightSum = ($weights | Measure-Object -Sum).Sum
    $widths = New-Object int[] $columnCount

    for ($i = 0; $i -lt $columnCount; $i++) {
        $widths[$i] = [Math]::Max(1300, [int]([Math]::Floor(($weights[$i] / $weightSum) * $TotalWidth)))
    }

    $current = ($widths | Measure-Object -Sum).Sum
    $widths[$columnCount - 1] += ($TotalWidth - $current)

    return $widths
}

function Get-ColumnAlignments {
    param(
        [string[]]$Headers,
        [object[]]$Rows
    )

    $alignments = foreach ($index in 0..($Headers.Count - 1)) {
        $maxLength = $Headers[$index].Length
        foreach ($row in $Rows) {
            if ($index -lt $row.Count) {
                $maxLength = [Math]::Max($maxLength, ([string]$row[$index]).Length)
            }
        }

        if ($maxLength -le 16) { 'center' } else { 'left' }
    }

    return ,$alignments
}

function New-MarkdownTableXml {
    param(
        [string[]]$Headers,
        [object[]]$Rows
    )

    $widths = Get-ColumnWidths -Headers $Headers -Rows $Rows
    $alignments = Get-ColumnAlignments -Headers $Headers -Rows $Rows
    $gridXml = ($widths | ForEach-Object { "<w:gridCol w:w=`"$_`"/>" }) -join "`n    "

    $headerCells = for ($i = 0; $i -lt $Headers.Count; $i++) {
        New-TableCellXml -Text $Headers[$i] -Width $widths[$i] -Fill '1F4E79' -Align $alignments[$i] -Size 18 -Color 'FFFFFF' -Bold
    }

    $rowsXml = for ($rowIndex = 0; $rowIndex -lt $Rows.Count; $rowIndex++) {
        $fill = if ($rowIndex % 2 -eq 0) { 'F7FAFC' } else { 'FFFFFF' }
        $cellsXml = for ($col = 0; $col -lt $Headers.Count; $col++) {
            $value = if ($col -lt $Rows[$rowIndex].Count) { [string]$Rows[$rowIndex][$col] } else { '' }
            New-TableCellXml -Text $value -Width $widths[$col] -Fill $fill -Align $alignments[$col] -Size 18 -Color '000000'
        }

        @"
<w:tr>
  $($cellsXml -join "`n")
</w:tr>
"@
    }

    return @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="10000" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:space="0" w:color="1F4E79"/>
      <w:left w:val="single" w:sz="8" w:space="0" w:color="1F4E79"/>
      <w:bottom w:val="single" w:sz="8" w:space="0" w:color="1F4E79"/>
      <w:right w:val="single" w:sz="8" w:space="0" w:color="1F4E79"/>
      <w:insideH w:val="single" w:sz="6" w:space="0" w:color="D6E0EA"/>
      <w:insideV w:val="single" w:sz="6" w:space="0" w:color="D6E0EA"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    $gridXml
  </w:tblGrid>
  <w:tr>
    <w:trPr><w:tblHeader/></w:trPr>
    $($headerCells -join "`n")
  </w:tr>
  $($rowsXml -join "`n")
</w:tbl>
"@
}

function Register-Image {
    param([string]$RelativePath)

    $resolved = Join-Path $PSScriptRoot $RelativePath
    if (-not (Test-Path -LiteralPath $resolved)) {
        return $null
    }

    $image = [System.Drawing.Image]::FromFile($resolved)
    try {
        $widthPx = $image.Width
        $heightPx = $image.Height
    }
    finally {
        $image.Dispose()
    }

    $maxWidthEmu = [int](6.0 * 914400)
    $cx = [int](($widthPx / 96.0) * 914400)
    $cy = [int](($heightPx / 96.0) * 914400)

    if ($cx -gt $maxWidthEmu) {
        $scale = $maxWidthEmu / $cx
        $cx = [int]($cx * $scale)
        $cy = [int]($cy * $scale)
    }

    $extension = [System.IO.Path]::GetExtension($resolved).TrimStart('.').ToLowerInvariant()
    $targetName = "image$($script:ImageCounter).$extension"
    $registration = [pscustomobject]@{
        RelId      = "rIdImg$($script:ImageCounter)"
        TargetName = $targetName
        SourcePath = $resolved
        Extension  = $extension
        Cx         = $cx
        Cy         = $cy
        DocPrId    = $script:DrawingCounter
    }

    $script:ImageRegistry.Add($registration)
    $script:ImageCounter++
    $script:DrawingCounter++

    return $registration
}

function New-ImageParagraphXml {
    param([object]$Image)

    $name = Escape-Xml $Image.TargetName

    return @"
<w:p>
  <w:pPr>
    <w:jc w:val="center"/>
    <w:spacing w:before="20" w:after="80"/>
  </w:pPr>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="$($Image.Cx)" cy="$($Image.Cy)"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="$($Image.DocPrId)" name="$name"/>
        <wp:cNvGraphicFramePr>
          <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
        </wp:cNvGraphicFramePr>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr>
                <pic:cNvPr id="$($Image.DocPrId)" name="$name"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="$($Image.RelId)"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm>
                  <a:off x="0" y="0"/>
                  <a:ext cx="$($Image.Cx)" cy="$($Image.Cy)"/>
                </a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                <a:ln w="6350">
                  <a:solidFill><a:srgbClr val="D1D9E6"/></a:solidFill>
                </a:ln>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
"@
}

function Parse-MarkdownTable {
    param([string[]]$Lines)

    $cleanRows = foreach ($line in $Lines) {
        $trimmed = $line.Trim()
        if (-not $trimmed.StartsWith('|')) {
            continue
        }

        $parts = $trimmed.Split('|')
        if ($parts.Count -lt 3) {
            continue
        }

        ,@($parts[1..($parts.Count - 2)] | ForEach-Object { $_.Trim() })
    }

    if ($cleanRows.Count -lt 2) {
        return $null
    }

    $headers = $cleanRows[0]
    $rows = @()

    for ($i = 1; $i -lt $cleanRows.Count; $i++) {
        $candidate = $cleanRows[$i]
        $isSeparator = $true
        foreach ($cell in $candidate) {
            if ($cell -notmatch '^[\-\:\s]+$') {
                $isSeparator = $false
                break
            }
        }

        if (-not $isSeparator) {
            $rows += ,$candidate
        }
    }

    return [pscustomobject]@{
        Headers = $headers
        Rows    = $rows
    }
}

function Flush-ParagraphBuffer {
    param(
        [System.Collections.Generic.List[string]]$ParagraphBuffer,
        [System.Collections.Generic.List[string]]$BodyParts
    )

    if ($ParagraphBuffer.Count -eq 0) {
        return
    }

    $text = ($ParagraphBuffer | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }) -join ' '
    if (-not [string]::IsNullOrWhiteSpace($text)) {
        $BodyParts.Add((New-TextParagraph -Text $text -Size 21 -Color '222222' -SpacingAfter 90))
    }

    $ParagraphBuffer.Clear()
}

function Flush-TableBuffer {
    param(
        [System.Collections.Generic.List[string]]$TableBuffer,
        [System.Collections.Generic.List[string]]$BodyParts
    )

    if ($TableBuffer.Count -eq 0) {
        return
    }

    $parsed = Parse-MarkdownTable -Lines $TableBuffer.ToArray()
    if ($null -ne $parsed -and $parsed.Rows.Count -gt 0) {
        $BodyParts.Add((New-MarkdownTableXml -Headers $parsed.Headers -Rows $parsed.Rows))
    }

    $TableBuffer.Clear()
}

function Flush-CodeBuffer {
    param(
        [System.Collections.Generic.List[string]]$CodeBuffer,
        [System.Collections.Generic.List[string]]$BodyParts
    )

    if ($CodeBuffer.Count -eq 0) {
        return
    }

    $BodyParts.Add((New-CodeBox -Lines $CodeBuffer.ToArray()))
    $CodeBuffer.Clear()
}

$lines = Get-Content -LiteralPath $MarkdownPath
$title = 'Rapport du Sprint 1'
if ($lines.Count -gt 0 -and $lines[0].Trim() -match '^#\s+(.+)$') {
    $title = $matches[1].Trim()
}

$bodyParts = New-Object System.Collections.Generic.List[string]
$paragraphBuffer = New-Object System.Collections.Generic.List[string]
$tableBuffer = New-Object System.Collections.Generic.List[string]
$codeBuffer = New-Object System.Collections.Generic.List[string]
$inCodeBlock = $false

$bodyParts.Add((New-SectionBanner -Text 'Sprint Report'))
$bodyParts.Add((New-TextParagraph -Text $title -Align 'center' -Size 34 -Color '1F2937' -Bold -SpacingBefore 60 -SpacingAfter 80))
$bodyParts.Add((New-TextParagraph -Text 'Smart e-commerce platform' -Align 'center' -Size 22 -Color '4B5563' -SpacingAfter 40))
$bodyParts.Add((New-TextParagraph -Text ("Word version generated on " + (Get-Date -Format 'dd/MM/yyyy HH:mm')) -Align 'center' -Size 18 -Color '6B7280' -SpacingAfter 140))
$bodyParts.Add((New-CalloutBox -Text "The figures available in the screenshots folder are inserted automatically. The remaining figures keep a reserved placeholder for the final version of the report."))
$bodyParts.Add((New-PageBreakXml))

for ($lineIndex = 1; $lineIndex -lt $lines.Count; $lineIndex++) {
    $line = $lines[$lineIndex]
    $trimmed = $line.Trim()

    if ($inCodeBlock) {
        if ($trimmed -match '^```') {
            Flush-CodeBuffer -CodeBuffer $codeBuffer -BodyParts $bodyParts
            $inCodeBlock = $false
        }
        else {
            $codeBuffer.Add($line)
        }
        continue
    }

    if ($tableBuffer.Count -gt 0 -and -not $trimmed.StartsWith('|')) {
        Flush-TableBuffer -TableBuffer $tableBuffer -BodyParts $bodyParts
    }

    if ([string]::IsNullOrWhiteSpace($trimmed)) {
        Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
        continue
    }

    if ($trimmed -match '^```') {
        Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
        $inCodeBlock = $true
        continue
    }

    if ($trimmed.StartsWith('|')) {
        Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
        $tableBuffer.Add($line)
        continue
    }

    if ($trimmed -match '^(#{2,4})\s+(.+)$') {
        Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
        $level = $matches[1].Length
        $headingText = $matches[2].Trim()

        if ($level -eq 2) {
            $bodyParts.Add((New-SectionBanner -Text $headingText))
        }
        elseif ($headingText -like 'Figure *' -or $headingText -like 'Tableau *') {
            $bodyParts.Add((New-CaptionParagraph -Text $headingText))
        }
        else {
            $bodyParts.Add((New-HeadingParagraph -Text $headingText -Level $level))
        }
        continue
    }

    if ($trimmed -match '^\*\*(.+?)\*\*$') {
        Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
        $captionText = $matches[1].Trim()
        if ($captionText -like 'Figure *' -or $captionText -like 'Tableau *') {
            $bodyParts.Add((New-CaptionParagraph -Text $captionText))
        }
        else {
            $bodyParts.Add((New-TextParagraph -Text $captionText -Size 20 -Color '1F2937' -Bold -SpacingAfter 40))
        }
        continue
    }

    if ($trimmed -match '!\[(.*?)\]\((.+?)\)') {
        Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
        $imagePath = $matches[2].Trim()
        $registration = Register-Image -RelativePath $imagePath
        if ($null -ne $registration) {
            $bodyParts.Add((New-ImageParagraphXml -Image $registration))
        }
        else {
            $bodyParts.Add((New-CalloutBox -Text ("Image not found: " + $imagePath)))
        }
        continue
    }

    if ($trimmed -match '^\[(.+)\]$') {
        Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
        $bodyParts.Add((New-CalloutBox -Text $matches[1]))
        continue
    }

    if ($trimmed -match '^- (.+)$') {
        Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
        $bodyParts.Add((New-TextParagraph -Text ('- ' + $matches[1].Trim()) -Size 20 -Color '222222' -SpacingAfter 40 -IndentLeft 360))
        continue
    }

    if ($trimmed -match '^\d+\.\s+.+$') {
        Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
        $bodyParts.Add((New-TextParagraph -Text $trimmed -Size 20 -Color '222222' -SpacingAfter 30 -IndentLeft 420))
        continue
    }

    $paragraphBuffer.Add($trimmed)
}

Flush-ParagraphBuffer -ParagraphBuffer $paragraphBuffer -BodyParts $bodyParts
Flush-TableBuffer -TableBuffer $tableBuffer -BodyParts $bodyParts
Flush-CodeBuffer -CodeBuffer $codeBuffer -BodyParts $bodyParts

$imageDefaults = @()
if ($script:ImageRegistry.Count -gt 0) {
    $imageDefaults = $script:ImageRegistry |
        Select-Object -ExpandProperty Extension -Unique |
        ForEach-Object {
            switch ($_) {
                'png'  { '<Default Extension="png" ContentType="image/png"/>' }
                'jpg'  { '<Default Extension="jpg" ContentType="image/jpeg"/>' }
                'jpeg' { '<Default Extension="jpeg" ContentType="image/jpeg"/>' }
                default { '' }
            }
        } |
        Where-Object { $_ }
}

$imageRelationships = foreach ($image in $script:ImageRegistry) {
    "<Relationship Id=`"$($image.RelId)`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image`" Target=`"media/$($image.TargetName)`"/>"
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
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
            mc:Ignorable="w14 wp14">
  <w:body>
    $($bodyParts -join "`n")
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="900" w:right="850" w:bottom="900" w:left="850" w:header="450" w:footer="450" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$contentTypesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  $($imageDefaults -join "`n  ")
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"@

$rootRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$documentRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  $($imageRelationships -join "`n  ")
</Relationships>
"@

$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>$([System.Security.SecurityElement]::Escape($title))</dc:title>
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
      <vt:lpstr>$([System.Security.SecurityElement]::Escape($title))</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company>OpenAI</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>
"@

$finalOutputPath = $OutputPath

try {
    New-Item -ItemType Directory -Path $tempRoot | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempRoot '_rels') | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempRoot 'docProps') | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempRoot 'word') | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempRoot 'word\_rels') | Out-Null

    if ($script:ImageRegistry.Count -gt 0) {
        New-Item -ItemType Directory -Path (Join-Path $tempRoot 'word\media') | Out-Null
        foreach ($image in $script:ImageRegistry) {
            Copy-Item -LiteralPath $image.SourcePath -Destination (Join-Path $tempRoot ("word\media\" + $image.TargetName))
        }
    }

    [System.IO.File]::WriteAllText((Join-Path $tempRoot '[Content_Types].xml'), $contentTypesXml, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempRoot '_rels\.rels'), $rootRelsXml, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'docProps\core.xml'), $coreXml, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'docProps\app.xml'), $appXml, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'word\document.xml'), $documentXml, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'word\_rels\document.xml.rels'), $documentRelsXml, $utf8NoBom)

    if (Test-Path -LiteralPath $OutputPath) {
        try {
            Remove-Item -LiteralPath $OutputPath -Force
        }
        catch {
            $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
            $finalOutputPath = Join-Path $PSScriptRoot ("rapport-sprint-ecommerce-$timestamp.docx")
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
            # Ignore transient temp lock issues.
        }
    }
}

Write-Output "Created $finalOutputPath"
