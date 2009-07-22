// ==========================================================================
// Project:   SharedAssets.languageController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals SharedAssets */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
SharedAssets.languageController = SC.ArrayController.create(
/** @scope SharedAssets.languageController.prototype */ {

  /**
    Define languages to display in the picker pane here
  */
  LANGUAGES: [
    { key: "en", title: "English", icon: sc_static('flags/en') },
    { key: "fr", title: "Français", icon: sc_static('flags/fr') },
    { key: "no", title: "Norsk (Bokmål)", icon: sc_static('flags/no') },
    { key: "ru", title: "Русский", icon: sc_static('flags/ru') },
    { key: "uk", title: "Українська", icon: sc_static('flags/uk') }
  ],
  
  /**
    Displays the picker.
  */
  showPicker: function() {
    
    // first build the content object if needed.
    if (!this.get('content')) {
      var content = this.LANGUAGES.map(function(hash) {
        return SC.Object.create(hash);
      });
      this.set('content', content);
    }
    
    // next, select the current language.
    var lang = SC.Locale.currentLanguage;
    var item = this.findProperty('key', lang);
    if (item) this.selectObject(item);
    
    var pane = SharedAssets.getPath('languagePage.mainPane');
    pane.append();
    
    pane.getPath('contentView.scrollView.contentView').becomeFirstResponder();
  },

  chooseLanguage: function() {
    // hide language pane
    var pane = SharedAssets.getPath('languagePage.mainPane');
    pane.remove();
    
    var lang = this.get('selection').firstObject();
    var clang = SC.Locale.currentLanguage;
    
    lang = lang ? lang.get('key') : clang;
    
    // ok pick the right URL to go to. - first normalize URL.
    if (lang !== clang) {
      // unfortunately we can't localize the blog so just go to home page
      var href = window.location.href.toString();
      if (!href.match(/\/\/www\.sproutcore\.com/) && 
          !href.match(/\/\/localhost/)) {
        href = "http://www.sproutcore.com/home"; // go to home 
      }

      // normalize
      if (href.match(/^http:\/\/www\.sproutcore\.com\/?$/)) {
        href = "http://www.sproutcore.com/home/en";
      }
      
      // remove current language
      href = href.replace(new RegExp("\/%@\/?$".fmt(clang)), '');
      href = href.replace(/\/$/,''); // clean up end
      
      // now add new language and denormalize
      href = "%@/%@".fmt(href, lang);
      if (href.match(/sproutcore\.com\/home\/en\/?/)) href = "http://www.sproutcore.com";
      
      // go to new location
      window.location = href ;
    }
  },
  
  handleMouseDownOnFlag: function() {
    SC.RunLoop.begin();
    this.showPicker();
    SC.RunLoop.end();
  }
  
}) ;

SC.ready(function() {
  SC.Event.add(SC.$('#select_language'), 'mousedown', SharedAssets.languageController, 'handleMouseDownOnFlag'); 
});