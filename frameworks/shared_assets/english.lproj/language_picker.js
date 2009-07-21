// ==========================================================================
// Project:   SharedAssets
// Copyright: ©2009 Sprout Systems, Inc.
// ==========================================================================
/*globals SharedAssets */

SharedAssets.languagePage = SC.Page.design({
  
  mainPane: SC.PanelPane.design({
    layout: { width: 300, height: 300, centerX: 0, centerY: 0 },
    
    contentView: SC.View.design({
      layout: { top: 0, left: 0, bottom: 0, right: 0 },
      childViews: 'selectButton label scrollView'.w(),
      
      label: SC.LabelView.design({
        layout: { top: 20, left: 20, right: 20, height: 20 },
        value: "_Select a language:".loc()
      }),
      
      scrollView: SC.ScrollView.design({
        layout: { top: 50, bottom: 60, left: 20, right: 20 },
        hasHorizontalScroller: NO,
        borderStyle: SC.BORDER_GRAY,
        
        contentView: SC.ListView.design({
          contentBinding: "SharedAssets.languageController.arrangedObjects",
          contentIconKey: "icon",
          contentValueKey: "title",
          hasContentIcon: YES,
          rowHeight: 32,
          
          selectionBinding: "SharedAssets.languageController.selection"
        })
      }),
      
      selectButton: SC.ButtonView.design({
        layout: { centerX: 0, width: 150, height: 24, bottom: 20 },
        title: "_Choose Language".loc(),
        isDefault: YES,
        action: "chooseLanguage",
        target: "SharedAssets.languageController"
      })
      
    })
  })
});
