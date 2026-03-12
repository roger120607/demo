(function() {
    var VpaidAd = function() {
        this._slot = null;
        this._videoSlot = null;
        this._eventsCallbacks = {};
        this._logContainer = null;
    };

    // --- 可视化日志：直接在手机屏幕上显示调试信息 ---
    VpaidAd.prototype.log = function(msg, color) {
        console.log("VPAID_LOG: " + msg);
        if (!this._logContainer) {
            this._logContainer = document.createElement('div');
            this._logContainer.style = "position:absolute;top:0;left:0;width:100%;z-index:999999;background:rgba(0,0,0,0.8);color:#0f0;font-size:10px;pointer-events:none;padding:5px;";
            if (this._slot) this._slot.appendChild(this._logContainer);
        }
        var line = document.createElement('div');
        line.style.color = color || "#0f0";
        line.innerText = "> " + msg;
        this._logContainer.appendChild(line);
    };

    VpaidAd.prototype.handshakeVersion = function(version) { return '2.0'; };

    VpaidAd.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
        this._slot = environmentVars.slot;
        this._videoSlot = environmentVars.videoSlot;
        
        this.log("Step 1: initAd Called");
        this.log("Slot Status: " + (this._slot ? "OK" : "MISSING"), this._slot ? "" : "red");
        this.log("VideoSlot Status: " + (this._videoSlot ? "OK" : "MISSING (iOS common)"), this._videoSlot ? "" : "orange");

        try {
            this._config = JSON.parse(creativeData.AdParameters);
            this.log("Step 2: AdParameters Parsed OK");
        } catch (e) {
            this.log("Step 2 Error: JSON Parse Failed", "red");
            this.callEvent('AdError');
            return;
        }

        this.callEvent('AdLoaded');
        this.log("Step 3: AdLoaded Event Sent");
    };

    VpaidAd.prototype.startAd = function() {
        this.log("Step 4: startAd Called");
        var self = this;

        // 检查 iOS 下的视频自动播放限制
        if (this._videoSlot) {
            this.log("Video Info: src=" + this._videoSlot.currentSrc);
            this._videoSlot.addEventListener('play', function() { self.log("Event: Video Playing"); });
            this._videoSlot.addEventListener('timeupdate', function() {
                // 每秒打印一次进度，确认监听是否有效
                if (Math.floor(self._videoSlot.currentTime) % 2 === 0) {
                    self.log("Video Tick: " + self._videoSlot.currentTime.toFixed(1));
                }
                if (self._videoSlot.currentTime >= 5 && !self._isInteracted) {
                    self.showInteraction();
                }
            });
        } else {
            this.log("Warning: No native video slot, manual trigger in 5s", "orange");
            setTimeout(function() { self.showInteraction(); }, 5000);
        }

        this.callEvent('AdStarted');
        this.log("Step 5: AdStarted Event Sent");
    };

    VpaidAd.prototype.showInteraction = function() {
        this._isInteracted = true;
        this.log("Step 6: Attempting to show Interaction Layer", "cyan");
        
        var overlay = document.createElement('div');
        overlay.style = "position:absolute;inset:0;background:rgba(255,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:2147483647;pointer-events:auto;";
        overlay.innerHTML = "<div style='background:white;padding:20px;border:3px solid black;'>TEST INTERACTION<br>Click to Close</div>";
        
        overlay.onclick = function() { 
            overlay.remove();
            self.log("Interaction Clicked & Removed");
        };

        try {
            this._slot.appendChild(overlay);
            this.log("Success: Overlay appended to slot", "yellow");
        } catch(e) {
            this.log("Error: Append failed: " + e.message, "red");
        }
    };

    // 标准 API 存根
    VpaidAd.prototype.subscribe = function(a, b, c) { this._eventsCallbacks[b] = a; };
    VpaidAd.prototype.unsubscribe = function(a) { delete this._eventsCallbacks[a]; };
    VpaidAd.prototype.callEvent = function(e) { if(this._eventsCallbacks[e]) this._eventsCallbacks[e](); };
    VpaidAd.prototype.stopAd = function() {};
    VpaidAd.prototype.skipAd = function() {};
    VpaidAd.prototype.resizeAd = function(w, h, vm) {};
    VpaidAd.prototype.pauseAd = function() {};
    VpaidAd.prototype.resumeAd = function() {};
    VpaidAd.prototype.expandAd = function() {};
    VpaidAd.prototype.collapseAd = function() {};

    window.getVPAIDAd = function() { return new VpaidAd(); };
})();