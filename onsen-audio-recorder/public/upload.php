<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $format = $_POST['format'];
    $outputOptions = explode(',', $_POST['outputOptions']);
    $fileTmpPath = $_FILES['audio']['tmp_name'];
    $uploadDir = '../recordings/';
    $tempName = uniqid() . '.' . pathinfo($_FILES['audio']['name'], PATHINFO_EXTENSION);
    $tempPath = $uploadDir . $tempName;

    if (move_uploaded_file($fileTmpPath, $tempPath)) {
        $outputFile = $uploadDir . 'rec' . date('YmdHis') . '.' . $format;
        $ffmpegOptions = implode(' ', array_map(function($option) {
            return '-f ' . $option;
        }, $outputOptions));

        $cmd = "ffmpeg -i $tempPath $ffmpegOptions $outputFile 2>&1";
        exec($cmd, $output, $returnVar);

        if ($returnVar === 0) {
            unlink($tempPath);
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . basename($outputFile) . '"');
            readfile($outputFile);
            unlink($outputFile);
        } else {
            echo 'Error: ' . implode("\n", $output);
        }
    } else {
        echo 'Failed to move uploaded file.';
    }
}
?>
