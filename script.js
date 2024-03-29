// common variables
var iBytesUploaded = 0;
var iBytesTotal = 0;
var iPreviousBytesLoaded = 0;
var iMaxFilesize = 10485760; // 10MB
var sResultFileSize = "";

function secondsToTime(secs) { // we will use this function to convert seconds in normal time format
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr < 10) {hr = "0" + hr; }
    if (min < 10) {min = "0" + min;}
    if (sec < 10) {sec = "0" + sec;}
    if (hr) {hr = "00";}
    return hr + ":" + min + ":" + sec;
};

function bytesToSize(bytes) {
    var sizes = ["Bytes", "KB", "MB"];
    if (bytes === 0) return "n/a";
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.ceil(bytes / Math.pow(1024, i)) + " " + sizes[i];
};

function fileSelected() {

    // hide different warnings
    document.getElementById("upload_response").style.display = "none";
    document.getElementById("error").style.display = "none";
    document.getElementById("error2").style.display = "none";
    document.getElementById("abort").style.display = "none";
    document.getElementById("warnsize").style.display = "none";
    document.getElementById("progress_info").style.display = "none";

    // get selected file element
    var oFile = document.getElementById("image_file").files[0];

    // filter for image files
    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
    // if (!rFilter.test(oFile.type)) {
    //     document.getElementById("error").style.display = "block";
    //     return;
    // }

    // little test for filesize
    if (oFile.size > iMaxFilesize) {
        document.getElementById("warnsize").style.display = "block";
        return;
    }

    // prepare HTML5 FileReader
    var oReader = new FileReader();
    oReader.onload = function(e){
        // we are going to display some custom image information here
        sResultFileSize = bytesToSize(oFile.size);
        document.getElementById("fileinfo").style.display = "block";
        document.getElementById("filename").innerHTML = "name: " + oFile.name;
        document.getElementById("filesize").innerHTML = "size: " + sResultFileSize;
        document.getElementById("filetype").innerHTML = "type: " + oFile.type;
        
        if (rFilter.test(oFile.type)) {
            // get preview element
            var oImage = document.getElementById("preview");

            // e.target.result contains the DataURL which we will use as a source of the image
            oImage.parentNode.style.display = "block";
            oImage.src = e.target.result;
            oImage.onload = function () { // binding onload event
                var imgWidth = oImage.naturalWidth || oImage.width
                var imgHeight = oImage.naturalHeight || oImage.height
                document.getElementById("filedim").innerHTML = "dimension: " + imgWidth + "X" + imgHeight;
            };
        }
    };

    // read selected file as DataURL
    oReader.readAsDataURL(oFile);
}

function startUploading() {
    // cleanup all temp states
    iPreviousBytesLoaded = 0;
    document.getElementById("upload_response").style.display = "none";
    document.getElementById("error").style.display = "none";
    document.getElementById("error2").style.display = "none";
    document.getElementById("abort").style.display = "none";
    document.getElementById("warnsize").style.display = "none";
    document.getElementById("progress_info").style.display = "block";
    document.getElementById("progress_percent").innerHTML = "";
    var oProgress = document.getElementById("progress");

    // get form data for POSTing
    //var vFD = document.getElementById("upload_form").getFormData(); // for FF3
    var vFD = new FormData(document.getElementById("upload_form"));

    if (vFD.get("image_file").size) {
        // create XMLHttpRequest object, adding few event listeners, and POSTing our data
        var oXHR = new XMLHttpRequest();
        oXHR.upload.addEventListener("progress", uploadProgress);
        oXHR.addEventListener("load", uploadFinish);
        oXHR.addEventListener("error", uploadError);
        oXHR.addEventListener("abort", uploadAbort);
        oXHR.open("POST", "https://api.freedomlove.me/upload");
        oXHR.send(vFD);

        oProgress.style.display = "block";
        oProgress.style.width = "0px";
    } else {
        alert("please choese a img file!");
    }
}

function doInnerUpdates() { // we will use this function to display upload speed
    var iCB = iBytesUploaded;
    var iDiff = iCB - iPreviousBytesLoaded;

    // if nothing new loaded - exit
    if (iDiff === 0)
        return;

    iPreviousBytesLoaded = iCB;
    iDiff = iDiff * 2;
    var iBytesRem = iBytesTotal - iPreviousBytesLoaded;
    var secondsRemaining = iBytesRem / iDiff;

    // update speed info
    var iSpeed = iDiff.toString() + "B/s";
    if (iDiff > 1024 * 1024) {
        iSpeed = (Math.round(iDiff * 100/(1024*1024))/100).toString() + "MB/s";
    } else if (iDiff > 1024) {
        iSpeed =  (Math.round(iDiff * 100/1024)/100).toString() + "KB/s";
    }

    document.getElementById("remaining").innerHTML = secondsToTime(secondsRemaining) + "&nbsp;|&nbsp;";
    document.getElementById("speed").innerHTML = iSpeed;
}

function uploadProgress(e) { // upload process in progress
    if (e.lengthComputable) {
        iBytesUploaded = e.loaded;
        iBytesTotal = e.total;
        var iPercentComplete = Math.round(e.loaded * 100 / e.total);
        var iBytesTransfered = bytesToSize(iBytesUploaded);

        document.getElementById("progress_percent").innerHTML = iPercentComplete.toString() + "%";
        document.getElementById("progress").style.width = (iPercentComplete * 2.5).toString() + "px";
        document.getElementById("b_transfered").innerHTML = iBytesTransfered;
        doInnerUpdates();
        if (iPercentComplete === 100) {
            var oUploadResponse = document.getElementById("upload_response");
            oUploadResponse.innerHTML = "Processing, please wait...";
            oUploadResponse.style.display = "block";
        }
    } else {
        document.getElementById("progress").innerHTML = "unable to compute";
    }
}

function uploadFinish(e) { // upload successfully finished
    var oUploadResponse = document.getElementById("upload_response");
    oUploadResponse.innerHTML = e.target.responseText;
    oUploadResponse.style.display = "block";

    document.getElementById("progress_percent").innerHTML = "100%";
    document.getElementById("progress").style.width = "250px";
    document.getElementById("filesize").innerHTML = "size:" + sResultFileSize;
    document.getElementById("remaining").innerHTML = "Transfer Completed";
    document.getElementById("speed").innerHTML = "";
}

function uploadError(e) { // upload error
    document.getElementById("error2").style.display = "block";
    document.getElementById("progress_info").style.display = "none";
}

function uploadAbort(e) { // upload abort
    document.getElementById("abort").style.display = "block";
    document.getElementById("progress_info").style.display = "none";
}
