module.exports.toast = function(msg) {
    this.toast_time && clearTimeout(this.toast_time)
    this.toast_time = setTimeout(function() {
        this.setData({
            isToast: false
        });

    }.bind(this), 2000);
    this.setData({
        isToast: true,
        toastMsg: msg,
    })



}