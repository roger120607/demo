/**
 * 补全所有 IAB 规定的必选方法，消除 901 错误
 */

// --- 属性读取方法 (Getters) ---
VpaidAd.prototype.getAdLinear = function() { return true; };
VpaidAd.prototype.getAdWidth = function() { return window.innerWidth; };
VpaidAd.prototype.getAdHeight = function() { return window.innerHeight; };
VpaidAd.prototype.getAdExpanded = function() { return false; };
VpaidAd.prototype.getAdSkippableState = function() { return true; };
VpaidAd.prototype.getAdRemainingTime = function() { return -2; }; // -2 表示不支持
VpaidAd.prototype.getAdDuration = function() { return this._config ? this._config.duration : 15; };
VpaidAd.prototype.getAdVolume = function() { return 1.0; };
VpaidAd.prototype.getAdCompanions = function() { return ''; };
VpaidAd.prototype.getAdIcons = function() { return false; }; // 修复你遇到的具体错误

// --- 属性设置方法 (Setters) ---
VpaidAd.prototype.setAdVolume = function(val) { console.log("VPAID: Set Volume", val); };

// --- 广告生命周期控制方法 ---
VpaidAd.prototype.resizeAd = function(width, height, viewMode) {
    console.log("VPAID: Resize to", width, height);
};
VpaidAd.prototype.pauseAd = function() {
    if (this._videoSlot) this._videoSlot.pause();
    this.callEvent('AdPaused');
};
VpaidAd.prototype.resumeAd = function() {
    if (this._videoSlot) this._videoSlot.play();
    this.callEvent('AdPlaying');
};
VpaidAd.prototype.expandAd = function() { };
VpaidAd.prototype.collapseAd = function() { };
VpaidAd.prototype.skipAd = function() {
    this.callEvent('AdSkipped');
    this.stopAd();
};

// --- 事件监听标准接口 ---
VpaidAd.prototype.subscribe = function(callback, eventName, context) {
    this._eventsCallbacks[eventName] = callback.bind(context);
};
VpaidAd.prototype.unsubscribe = function(eventName) {
    delete this._eventsCallbacks[eventName];
};
