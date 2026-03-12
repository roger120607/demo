/**
 * zMaticoo Interactive VPAID Engine v1.0
 * 适配移动端 SDK (Vungle, AppLovin, etc.)
 */
(function() {
    var VpaidAd = function() {
        this._slot = null;
        this._videoSlot = null;
        this._eventsCallbacks = {};
        this._config = {};
        this._isInteracted = false;
    };

    // --- VPAID 标准 API 实现 ---

    VpaidAd.prototype.handshakeVersion = function(version) { return '2.0'; };

    VpaidAd.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
        this._slot = environmentVars.slot;
        this._videoSlot = environmentVars.videoSlot;

        // 1. 解析 VAST 传入的 AdParameters
        try {
            this._config = JSON.parse(creativeData.AdParameters);
        } catch (e) {
            console.error("VPAID Error: 无法解析 AdParameters", e);
            this.callEvent('AdError');
            return;
        }

        console.log("VPAID Initialized: ", this._config);
        this.callEvent('AdLoaded');
    };

    VpaidAd.prototype.startAd = function() {
        console.log("VPAID Ad Started");
        var self = this;

        // 2. 监听视频播放进度，触发互动逻辑
        if (this._videoSlot) {
            this._videoSlot.addEventListener('timeupdate', function() {
                var currentTime = self._videoSlot.currentTime;
                var triggerTime = self._config.interactiveConfig.cta.showAt || 5;

                if (currentTime >= triggerTime && !self._isInteracted) {
                    self.showInteraction();
                }
            });
        }

        this.callEvent('AdStarted');
    };

    // --- 互动 UI 渲染逻辑 ---

    VpaidAd.prototype.showInteraction = function() {
        this._isInteracted = true;
        var self = this;
        var config = this._config.interactiveConfig;

        // 创建覆盖层容器
        var overlay = document.createElement('div');
        overlay.id = "zm-interaction-layer";
        overlay.style = "position:absolute; inset:0; background:rgba(0,0,0,0.5); display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; font-family:sans-serif; z-index:9999;";

        // 渲染表单或 CTA
        var formHTML = `
            <div style="background:#fff; color:#333; padding:20px; border-radius:10px; width:80%; max-width:300px; text-align:center;">
                <h4 style="margin-top:0;">${config.form.title}</h4>
                ${config.form.fields.map(f => `
                    <input type="${f.type}" placeholder="${f.label}" id="field-${f.name}" style="width:90%; margin:5px 0; padding:8px; border:1px solid #ccc; border-radius:4px;">
                `).join('')}
                <button id="zm-submit" style="background:#ff4400; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer; margin-top:10px;">
                    ${config.cta.text}
                </button>
            </div>
        `;

        overlay.innerHTML = formHTML;
        this._slot.appendChild(overlay);

        // 提交逻辑
        document.getElementById('zm-submit').onclick = function() {
            var email = document.getElementById('field-email')?.value;
            console.log("Lead Collected: ", email);
            
            // 发送数据到你的 tracker
            fetch(config.form.submitUrl, {
                method: 'POST',
                body: JSON.stringify({ email: email, rid: self._config.adServingId })
            });

            // 提交后移除或跳转
            overlay.innerHTML = "<h4 style='color:white;'>Thank you!</h4>";
            setTimeout(() => {
                overlay.remove();
                if (self._videoSlot) self._videoSlot.play();
            }, 2000);
        };

        // 暂停视频等待输入
        if (this._videoSlot) this._videoSlot.pause();
    };

    // --- 辅助方法 ---

    VpaidAd.prototype.subscribe = function(a, b, c) { this._eventsCallbacks[b] = a; };
    VpaidAd.prototype.unsubscribe = function(a) { delete this._eventsCallbacks[a]; };
    VpaidAd.prototype.callEvent = function(e) { 
        if(this._eventsCallbacks[e]) this._eventsCallbacks[e](); 
    };

    // 必需的方法存根 (VPAID 协议要求)
    VpaidAd.prototype.stopAd = function() {};
    VpaidAd.prototype.skipAd = function() {};
    VpaidAd.prototype.resizeAd = function(w, h, vm) {};
    VpaidAd.prototype.pauseAd = function() {};
    VpaidAd.prototype.resumeAd = function() {};
    VpaidAd.prototype.expandAd = function() {};
    VpaidAd.prototype.collapseAd = function() {};

    // 暴露入口
    window.getVPAIDAd = function() { return new VpaidAd(); };
})();