/**
 * VPAID Interactive Video Ad
 * VPAID 2.0 互动视频广告实现
 * 
 * 使用方法：
 * 1. 替换 VIDEO_URL 为你的视频地址
 * 2. 可选：修改表单字段和 CTA 配置
 * 3. 将文件部署到 CDN
 */

(function() {
  'use strict';

  // 调试日志
  console.log('[VPAID] Script loaded at', new Date().toISOString());
  console.log('[VPAID] Window location:', window.location.href);

  // ==================== 配置区域 ====================
  // 只需修改这里的配置
  const CONFIG = {
    // 视频地址 - 必须替换！
    videoUrl: 'https://imgcdn.zmaticoo.com/dsp/creative/video/2379ccba5e2b48b88a1382dcc187d431.mp4',
    
    // 备用视频（不同码率）
    fallbackVideos: [
      { bitrate: 2000, url: 'https://imgcdn.zmaticoo.com/dsp/creative/video/2379ccba5e2b48b88a1382dcc187d431.mp4' }
    ],
    
    // CTA 按钮配置
    cta: {
      showAt: 5,              // 第几秒显示
      text: 'Get Quote',      // 按钮文字
      position: 'center-bottom', // center-bottom, center, bottom-right
      backgroundColor: '#FF5722',
      textColor: '#FFFFFF',
      fontSize: '16px',
      padding: '12px 24px',
      borderRadius: '4px'
    },
    
    // 表单配置
    form: {
      title: 'Get Your Free Quote',
      subtitle: 'Fill in your details and we\'ll get back to you',
      submitText: 'Submit',
      successTitle: 'Thank You!',
      successMessage: 'We\'ll contact you soon.',
      fields: [
        { name: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'John Doe' },
        { name: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'john@example.com' },
        { name: 'phone', type: 'tel', label: 'Phone Number', required: false, placeholder: '+1 234 567 8900' },
        { name: 'company', type: 'text', label: 'Company', required: false, placeholder: 'Your Company' }
      ],
      submitEndpoint: '' // 从 AdParameters 读取
    },
    
    // 样式配置
    style: {
      overlayBackground: 'rgba(0, 0, 0, 0.85)',
      formBackground: '#FFFFFF',
      formBorderRadius: '8px',
      inputBorder: '#E0E0E0',
      inputFocusBorder: '#FF5722',
      buttonBackground: '#FF5722',
      buttonHoverBackground: '#E64A19',
      closeButtonColor: '#999999'
    }
  };

  // ==================== VPAID 实现 ====================
  
  function VPAIDInteractiveAd() {
    this.slot = null;
    this.videoSlot = null;
    this.events = {};
    this.params = {};
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 30;
    this.skipOffset = 5;
    this.ctaShown = false;
    this.formShown = false;
    this.formSubmitted = false;
    
    // VPAID 状态
    this.adLinear = true;
    this.adExpanded = false;
    this.adRemainingTime = 30;
    this.adDuration = 30;
    this.adVolume = 1;
    this.adSkippableState = false;
  }

  // VPAID 2.0 必需方法
  VPAIDInteractiveAd.prototype.handshakeVersion = function(version) {
    console.log('[VPAID] Handshake version:', version);
    return '2.0';
  };

  VPAIDInteractiveAd.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    console.log('[VPAID] ====== INIT AD CALLED ======');
    console.log('[VPAID] Dimensions:', width, 'x', height);
    console.log('[VPAID] ViewMode:', viewMode);
    console.log('[VPAID] Slot element:', environmentVars.slot);
    console.log('[VPAID] VideoSlot element:', environmentVars.videoSlot);
    
    this.slot = environmentVars.slot;
    this.videoSlot = environmentVars.videoSlot;
    
    if (!this.slot) {
      console.error('[VPAID] ERROR: Slot is null!');
      return;
    }
    
    // 解析 AdParameters
    if (creativeData && creativeData.AdParameters) {
      try {
        this.params = JSON.parse(creativeData.AdParameters);
        // 合并配置
        if (this.params.ctaConfig) Object.assign(CONFIG.cta, this.params.ctaConfig);
        if (this.params.formConfig) Object.assign(CONFIG.form, this.params.formConfig);
        if (this.params.duration) this.duration = this.params.duration;
        if (this.params.skipOffset) this.skipOffset = this.params.skipOffset;
      } catch (e) {
        console.error('[VPAID] Failed to parse AdParameters:', e);
      }
    }
    
    this.setupVideo();
    this.createUI();
    this.bindEvents();
    
    this.fireEvent('AdLoaded');
  };

  VPAIDInteractiveAd.prototype.startAd = function() {
    console.log('[VPAID] ====== START AD CALLED ======');
    this.isPlaying = true;
    
    if (this.videoSlot) {
      console.log('[VPAID] Playing video...');
      this.videoSlot.play().catch(function(e) {
        console.error('[VPAID] Video play error:', e);
      });
    } else {
      console.error('[VPAID] ERROR: Video slot is null!');
    }
    
    this.fireEvent('AdStarted');
    this.fireEvent('AdImpression');
    this.fireEvent('AdVideoStart');
    
    // 开始时间检查
    console.log('[VPAID] Starting time check...');
    this.startTimeCheck();
  };

  VPAIDInteractiveAd.prototype.stopAd = function() {
    console.log('[VPAID] StopAd');
    this.isPlaying = false;
    this.videoSlot.pause();
    this.fireEvent('AdStopped');
    this.cleanup();
  };

  VPAIDInteractiveAd.prototype.skipAd = function() {
    console.log('[VPAID] SkipAd');
    this.fireEvent('AdSkipped');
    this.stopAd();
  };

  VPAIDInteractiveAd.prototype.resizeAd = function(width, height, viewMode) {
    console.log('[VPAID] ResizeAd', { width, height, viewMode });
    this.updateUILayout();
  };

  VPAIDInteractiveAd.prototype.pauseAd = function() {
    console.log('[VPAID] PauseAd');
    if (this.isPlaying) {
      this.videoSlot.pause();
      this.isPlaying = false;
      this.fireEvent('AdPaused');
    }
  };

  VPAIDInteractiveAd.prototype.resumeAd = function() {
    console.log('[VPAID] ResumeAd');
    if (!this.isPlaying) {
      this.videoSlot.play();
      this.isPlaying = true;
      this.fireEvent('AdPlaying');
    }
  };

  VPAIDInteractiveAd.prototype.expandAd = function() {
    console.log('[VPAID] ExpandAd');
    this.adExpanded = true;
    this.fireEvent('AdExpanded');
  };

  VPAIDInteractiveAd.prototype.collapseAd = function() {
    console.log('[VPAID] CollapseAd');
    this.adExpanded = false;
    this.fireEvent('AdCollapsed');
  };

  // VPAID 属性获取
  VPAIDInteractiveAd.prototype.getAdLinear = function() {
    return this.adLinear;
  };

  VPAIDInteractiveAd.prototype.getAdWidth = function() {
    return this.slot ? this.slot.offsetWidth : 0;
  };

  VPAIDInteractiveAd.prototype.getAdHeight = function() {
    return this.slot ? this.slot.offsetHeight : 0;
  };

  VPAIDInteractiveAd.prototype.getAdExpanded = function() {
    return this.adExpanded;
  };

  VPAIDInteractiveAd.prototype.getAdSkippableState = function() {
    return this.adSkippableState;
  };

  VPAIDInteractiveAd.prototype.getAdRemainingTime = function() {
    return this.adRemainingTime;
  };

  VPAIDInteractiveAd.prototype.getAdDuration = function() {
    return this.adDuration;
  };

  VPAIDInteractiveAd.prototype.getAdVolume = function() {
    return this.adVolume;
  };

  VPAIDInteractiveAd.prototype.setAdVolume = function(volume) {
    this.adVolume = volume;
    if (this.videoSlot) {
      this.videoSlot.volume = volume;
    }
    this.fireEvent('AdVolumeChange');
  };

  VPAIDInteractiveAd.prototype.getAdCompanions = function() {
    return '';
  };

  VPAIDInteractiveAd.prototype.getAdIcons = function() {
    return '';
  };

  // 事件系统
  VPAIDInteractiveAd.prototype.subscribe = function(callback, eventName, context) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push({ callback: callback, context: context });
  };

  VPAIDInteractiveAd.prototype.unsubscribe = function(callback, eventName) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(function(e) {
        return e.callback !== callback;
      });
    }
  };

  VPAIDInteractiveAd.prototype.fireEvent = function(eventName, data) {
    console.log('[VPAID] Event:', eventName, data);
    if (this.events[eventName]) {
      this.events[eventName].forEach(function(e) {
        e.callback.call(e.context, data);
      });
    }
  };

  // ==================== 视频设置 ====================
  
  VPAIDInteractiveAd.prototype.setupVideo = function() {
    if (!this.videoSlot) return;
    
    // 设置视频源
    this.videoSlot.src = CONFIG.videoUrl;
    this.videoSlot.style.width = '100%';
    this.videoSlot.style.height = '100%';
    this.videoSlot.style.objectFit = 'contain';
    
    // 视频事件监听
    var self = this;
    this.videoSlot.addEventListener('timeupdate', function() {
      self.currentTime = self.videoSlot.currentTime;
      self.adRemainingTime = self.duration - self.currentTime;
      self.fireEvent('AdRemainingTimeChange');
    });
    
    this.videoSlot.addEventListener('ended', function() {
      self.fireEvent('AdVideoComplete');
      self.fireEvent('AdComplete');
    });
    
    this.videoSlot.addEventListener('volumechange', function() {
      self.adVolume = self.videoSlot.volume;
      self.fireEvent('AdVolumeChange');
    });
    
    this.videoSlot.addEventListener('error', function(e) {
      console.error('[VPAID] Video error:', e);
      self.fireEvent('AdError', 'Video playback error');
    });
  };

  // ==================== UI 创建 ====================
  
  VPAIDInteractiveAd.prototype.createUI = function() {
    console.log('[VPAID] Creating UI...');
    if (!this.slot) {
      console.error('[VPAID] ERROR: Cannot create UI - slot is null');
      return;
    }
    console.log('[VPAID] Slot found, dimensions:', this.slot.offsetWidth, 'x', this.slot.offsetHeight);
    
    // 创建容器
    this.container = document.createElement('div');
    this.container.style.cssText = [
      'position: absolute',
      'top: 0',
      'left: 0',
      'width: 100%',
      'height: 100%',
      'pointer-events: none',
      'z-index: 1000'
    ].join(';');
    
    this.slot.appendChild(this.container);
    
    // 创建 CTA 按钮
    this.createCTAButton();
    
    // 创建表单遮罩
    this.createFormOverlay();
    
    // 更新布局
    this.updateUILayout();
  };

  VPAIDInteractiveAd.prototype.createCTAButton = function() {
    var self = this;
    
    this.ctaButton = document.createElement('button');
    this.ctaButton.textContent = CONFIG.cta.text;
    this.ctaButton.style.cssText = [
      'position: absolute',
      'padding: ' + CONFIG.cta.padding,
      'background-color: ' + CONFIG.cta.backgroundColor,
      'color: ' + CONFIG.cta.textColor,
      'font-size: ' + CONFIG.cta.fontSize,
      'font-weight: bold',
      'border: none',
      'border-radius: ' + CONFIG.cta.borderRadius,
      'cursor: pointer',
      'pointer-events: auto',
      'box-shadow: 0 2px 8px rgba(0,0,0,0.3)',
      'transition: all 0.3s ease',
      'opacity: 0',
      'transform: translateY(20px)',
      'display: none'
    ].join(';');
    
    // 悬停效果
    this.ctaButton.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    });
    
    this.ctaButton.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    });
    
    // 点击事件
    this.ctaButton.addEventListener('click', function(e) {
      e.stopPropagation();
      self.onCTAClick();
    });
    
    this.container.appendChild(this.ctaButton);
  };

  VPAIDInteractiveAd.prototype.createFormOverlay = function() {
    var self = this;
    
    // 遮罩层
    this.formOverlay = document.createElement('div');
    this.formOverlay.style.cssText = [
      'position: absolute',
      'top: 0',
      'left: 0',
      'width: 100%',
      'height: 100%',
      'background-color: ' + CONFIG.style.overlayBackground,
      'display: none',
      'align-items: center',
      'justify-content: center',
      'pointer-events: auto',
      'z-index: 2000'
    ].join(';');
    
    // 表单容器
    this.formContainer = document.createElement('div');
    this.formContainer.style.cssText = [
      'background-color: ' + CONFIG.style.formBackground,
      'border-radius: ' + CONFIG.style.formBorderRadius,
      'padding: 32px',
      'max-width: 400px',
      'width: 90%',
      'max-height: 90%',
      'overflow-y: auto',
      'position: relative',
      'box-shadow: 0 4px 20px rgba(0,0,0,0.3)'
    ].join(';');
    
    // 关闭按钮
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = [
      'position: absolute',
      'top: 16px',
      'right: 16px',
      'background: none',
      'border: none',
      'font-size: 24px',
      'color: ' + CONFIG.style.closeButtonColor,
      'cursor: pointer',
      'line-height: 1'
    ].join(';');
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      self.hideForm();
    });
    this.formContainer.appendChild(closeBtn);
    
    // 标题
    var title = document.createElement('h2');
    title.textContent = CONFIG.form.title;
    title.style.cssText = [
      'margin: 0 0 8px 0',
      'font-size: 24px',
      'color: #333',
      'font-weight: bold'
    ].join(';');
    this.formContainer.appendChild(title);
    
    // 副标题
    var subtitle = document.createElement('p');
    subtitle.textContent = CONFIG.form.subtitle;
    subtitle.style.cssText = [
      'margin: 0 0 24px 0',
      'font-size: 14px',
      'color: #666'
    ].join(';');
    this.formContainer.appendChild(subtitle);
    
    // 表单
    this.form = document.createElement('form');
    this.form.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';
    
    // 创建字段
    CONFIG.form.fields.forEach(function(field) {
      var label = document.createElement('label');
      label.textContent = field.label + (field.required ? ' *' : '');
      label.style.cssText = [
        'font-size: 14px',
        'font-weight: 500',
        'color: #333',
        'display: flex',
        'flex-direction: column',
        'gap: 6px'
      ].join(';');
      
      var input = document.createElement('input');
      input.type = field.type;
      input.name = field.name;
      input.placeholder = field.placeholder || '';
      input.required = field.required;
      input.style.cssText = [
        'padding: 12px 16px',
        'border: 1px solid ' + CONFIG.style.inputBorder,
        'border-radius: 4px',
        'font-size: 14px',
        'transition: border-color 0.2s',
        'outline: none'
      ].join(';');
      
      input.addEventListener('focus', function() {
        this.style.borderColor = CONFIG.style.inputFocusBorder;
      });
      
      input.addEventListener('blur', function() {
        this.style.borderColor = CONFIG.style.inputBorder;
      });
      
      label.appendChild(input);
      self.form.appendChild(label);
    });
    
    // 提交按钮
    var submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = CONFIG.form.submitText;
    submitBtn.style.cssText = [
      'padding: 14px 24px',
      'background-color: ' + CONFIG.style.buttonBackground,
      'color: white',
      'font-size: 16px',
      'font-weight: bold',
      'border: none',
      'border-radius: 4px',
      'cursor: pointer',
      'margin-top: 8px',
      'transition: background-color 0.2s'
    ].join(';');
    
    submitBtn.addEventListener('mouseenter', function() {
      this.style.backgroundColor = CONFIG.style.buttonHoverBackground;
    });
    
    submitBtn.addEventListener('mouseleave', function() {
      this.style.backgroundColor = CONFIG.style.buttonBackground;
    });
    
    this.form.appendChild(submitBtn);
    
    // 表单提交
    this.form.addEventListener('submit', function(e) {
      e.preventDefault();
      self.onFormSubmit();
    });
    
    this.formContainer.appendChild(this.form);
    
    // 成功消息（初始隐藏）
    this.successMessage = document.createElement('div');
    this.successMessage.style.cssText = [
      'display: none',
      'text-align: center',
      'padding: 20px'
    ].join(';');
    
    var successIcon = document.createElement('div');
    successIcon.innerHTML = '&#10003;';
    successIcon.style.cssText = [
      'font-size: 48px',
      'color: #4CAF50',
      'margin-bottom: 16px'
    ].join(';');
    this.successMessage.appendChild(successIcon);
    
    var successTitle = document.createElement('h3');
    successTitle.textContent = CONFIG.form.successTitle;
    successTitle.style.cssText = [
      'margin: 0 0 8px 0',
      'font-size: 20px',
      'color: #333'
    ].join(';');
    this.successMessage.appendChild(successTitle);
    
    var successText = document.createElement('p');
    successText.textContent = CONFIG.form.successMessage;
    successText.style.cssText = [
      'margin: 0',
      'font-size: 14px',
      'color: #666'
    ].join(';');
    this.successMessage.appendChild(successText);
    
    var continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continue Watching';
    continueBtn.style.cssText = [
      'margin-top: 24px',
      'padding: 12px 24px',
      'background-color: ' + CONFIG.style.buttonBackground,
      'color: white',
      'font-size: 14px',
      'border: none',
      'border-radius: 4px',
      'cursor: ' + 'pointer'
    ].join(';');
    continueBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      self.hideForm();
      self.resumeAd();
    });
    this.successMessage.appendChild(continueBtn);
    
    this.formContainer.appendChild(this.successMessage);
    this.formOverlay.appendChild(this.formContainer);
    this.container.appendChild(this.formOverlay);
  };

  // ==================== 交互逻辑 ====================
  
  VPAIDInteractiveAd.prototype.startTimeCheck = function() {
    console.log('[VPAID] Time check started');
    var self = this;
    this.timeCheckInterval = setInterval(function() {
      if (!self.isPlaying) return;
      
      // 每 5 秒打印一次日志
      if (Math.floor(self.currentTime) % 5 === 0) {
        console.log('[VPAID] Current time:', self.currentTime, 'CTA shown:', self.ctaShown);
      }
      
      // 检查是否显示 CTA
      if (!self.ctaShown && self.currentTime >= CONFIG.cta.showAt) {
        console.log('[VPAID] Time threshold reached:', self.currentTime, '>=', CONFIG.cta.showAt);
        self.showCTA();
      }
      
      // 检查是否可以跳过
      if (!self.adSkippableState && self.currentTime >= self.skipOffset) {
        self.adSkippableState = true;
        self.fireEvent('AdSkippableStateChange');
      }
    }, 100);
  };

  VPAIDInteractiveAd.prototype.showCTA = function() {
    console.log('[VPAID] ====== SHOWING CTA ======');
    this.ctaShown = true;
    if (!this.ctaButton) {
      console.error('[VPAID] ERROR: CTA button not created!');
      return;
    }
    console.log('[VPAID] CTA element:', this.ctaButton);
    this.ctaButton.style.display = 'block';
    
    // 动画显示
    var self = this;
    setTimeout(function() {
      self.ctaButton.style.opacity = '1';
      self.ctaButton.style.transform = 'translateY(0)';
    }, 10);
    
    this.fireEvent('AdInteraction');
  };

  VPAIDInteractiveAd.prototype.hideCTA = function() {
    this.ctaButton.style.opacity = '0';
    this.ctaButton.style.transform = 'translateY(20px)';
    
    var self = this;
    setTimeout(function() {
      self.ctaButton.style.display = 'none';
    }, 300);
  };

  VPAIDInteractiveAd.prototype.onCTAClick = function() {
    console.log('[VPAID] CTA Clicked');
    this.fireEvent('AdInteraction');
    this.fireEvent('AdClickThru');
    this.showForm();
  };

  VPAIDInteractiveAd.prototype.showForm = function() {
    this.formShown = true;
    this.pauseAd();
    this.hideCTA();
    
    this.formOverlay.style.display = 'flex';
    this.form.style.display = 'flex';
    this.successMessage.style.display = 'none';
  };

  VPAIDInteractiveAd.prototype.hideForm = function() {
    this.formShown = false;
    this.formOverlay.style.display = 'none';
  };

  VPAIDInteractiveAd.prototype.onFormSubmit = function() {
    var self = this;
    
    // 收集表单数据
    var formData = {};
    var inputs = this.form.querySelectorAll('input');
    inputs.forEach(function(input) {
      formData[input.name] = input.value;
    });
    
    console.log('[VPAID] Form submitted:', formData);
    
    // 发送追踪事件
    this.fireEvent('AdInteraction');
    
    // 发送到服务器
    var submitUrl = this.params.submitEndpoint || CONFIG.form.submitEndpoint;
    if (submitUrl) {
      fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adId: this.params.adServingId || 'unknown',
          videoProgress: this.currentTime,
          timestamp: new Date().toISOString()
        })
      }).catch(function(e) {
        console.error('[VPAID] Submit error:', e);
      });
    }
    
    // 显示成功消息
    this.form.style.display = 'none';
    this.successMessage.style.display = 'block';
    this.formSubmitted = true;
  };

  VPAIDInteractiveAd.prototype.updateUILayout = function() {
    if (!this.ctaButton) return;
    
    // 根据位置设置 CTA 位置
    var position = CONFIG.cta.position;
    if (position === 'center-bottom') {
      this.ctaButton.style.bottom = '60px';
      this.ctaButton.style.left = '50%';
      this.ctaButton.style.transform = 'translateX(-50%)';
    } else if (position === 'center') {
      this.ctaButton.style.top = '50%';
      this.ctaButton.style.left = '50%';
      this.ctaButton.style.transform = 'translate(-50%, -50%)';
    } else if (position === 'bottom-right') {
      this.ctaButton.style.bottom = '60px';
      this.ctaButton.style.right = '20px';
    }
  };

  VPAIDInteractiveAd.prototype.bindEvents = function() {
    var self = this;
    
    // 视频点击穿透处理
    if (this.videoSlot) {
      this.videoSlot.addEventListener('click', function() {
        if (self.formShown) return;
        self.fireEvent('AdClickThru');
      });
    }
  };

  VPAIDInteractiveAd.prototype.cleanup = function() {
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  };

  // ==================== 导出 ====================
  
  // 创建全局实例
  window.getVPAIDAd = function() {
    return new VPAIDInteractiveAd();
  };
  
  // 兼容不同的加载方式
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return VPAIDInteractiveAd;
    });
  }
  
  console.log('[VPAID] Interactive Ad loaded v2.0');
  
})();