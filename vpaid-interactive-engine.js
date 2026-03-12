// --- 必须补齐的方法存根，防止 SDK 报错 ---

// 修复你遇到的 getAdIcons 错误
VpaidAd.prototype.getAdIcons = function() {
    return false; // 返回 false 表示没有自定义图标
};

// 建议一并补齐以下方法，防止后续报其它的 missing function
VpaidAd.prototype.getAdDuration = function() { return this._config.duration || 15; };
VpaidAd.prototype.getAdRemainingTime = function() { return -2; }; // 协议规定：不支持返回 -2
VpaidAd.prototype.getAdExpanded = function() { return false; };
VpaidAd.prototype.getAdSkippableState = function() { return true; };
VpaidAd.prototype.getAdWidth = function() { return window.innerWidth; };
VpaidAd.prototype.getAdHeight = function() { return window.innerHeight; };
VpaidAd.prototype.getAdVolume = function() { return 1.0; };

// 确保以下 setter 也有定义
VpaidAd.prototype.setAdVolume = function(val) {};
