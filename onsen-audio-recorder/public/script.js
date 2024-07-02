document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const playButton = document.getElementById('play');
    const downloadButton = document.getElementById('download');
    const noiseReductionCheckbox = document.getElementById('noiseReduction');
    const formatSelect = document.getElementById('format');
    const inputQualitySelect = document.getElementById('inputQuality');
    const outputQualitySelect = document.getElementById('outputQuality');

    let recorder;
    let audioBlob;
    let waveSurfer;

    startButton.addEventListener('click', async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const inputQuality = inputQualitySelect.value.split('_');
        const sampleRate = parseInt(inputQuality[0], 10);
        const bitsPerSample = parseInt(inputQuality[1], 10);

        recorder = new RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            numberOfAudioChannels: 1,
            desiredSampRate: sampleRate,
            disableLogs: true
        });

        if (noiseReductionCheckbox.checked) {
            // Apply noise reduction here if needed
        }

        recorder.startRecording();
        startButton.disabled = true;
        stopButton.disabled = false;
    });

    stopButton.addEventListener('click', () => {
        recorder.stopRecording(() => {
            audioBlob = recorder.getBlob();
            const url = URL.createObjectURL(audioBlob);

            waveSurfer = WaveSurfer.create({
                container: '#waveform',
                waveColor: 'green',
                progressColor: 'red'
            });

            waveSurfer.load(url);

            stopButton.disabled = true;
            playButton.disabled = false;
            downloadButton.disabled = false;
        });
    });

    playButton.addEventListener('click', () => {
        waveSurfer.playPause();
    });

    downloadButton.addEventListener('click', () => {
        const format = formatSelect.value;
        const outputQuality = outputQualitySelect.value.split('_');
        const outputOptions = [];

        if (format === 'wav') {
            const sampleRate = outputQuality[0];
            const bitsPerSample = outputQuality[1];
            outputOptions.push(`-ar ${sampleRate}`, `-ac 1`, `-sample_fmt s${bitsPerSample}`);
        } else if (format === 'mp3') {
            const bitrate = outputQuality[0];
            outputOptions.push(`-b:a ${bitrate}`);
        } else if (format === 'm4a') {
            const bitrate = outputQuality[0];
            outputOptions.push(`-b:a ${bitrate}`);
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, `recording.${format}`);
        formData.append('format', format);
        formData.append('outputOptions', outputOptions.join(','));

        fetch('upload.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rec${new Date().toISOString().replace(/[:.-]/g, '')}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(err => console.error('Error:', err));
    });
});
