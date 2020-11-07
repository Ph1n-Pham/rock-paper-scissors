var socket = io();

$('form').submit(function (e) {
    let msg = $("#msg").val();
    e.preventDefault();
    if (msg != '') {
        socket.emit("clientmsg", $("#msg").val());
        $("#msg").val('');
    }
})

socket.on('servermsg', function (msg) {
    $("#message").append($('<li>').text(msg), $("#message"))
})