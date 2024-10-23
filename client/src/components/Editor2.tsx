
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CharacterLimitPlugin} from '@lexical/react/LexicalCharacterLimitPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import {ClickableLinkPlugin} from '@lexical/react/LexicalClickableLinkPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {HorizontalRulePlugin} from '@lexical/react/LexicalHorizontalRulePlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import {useLexicalEditable} from '@lexical/react/useLexicalEditable';
import React, { useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import {CAN_USE_DOM} from '../shared/src/canUseDOM';

import {createWebsocketProvider} from './collaboration';
import {useSettings} from '../context/SettingsContext';
import {useSharedHistoryContext} from '../context/SharedHistoryContext';
import AutocompletePlugin from './plugins/AutocompletePlugin/index';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin/index';
import AutoLinkPlugin from './plugins/AutoLinkPlugin/index';
import CollapsiblePlugin from './plugins/CollapsiblePlugin/index';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin/index';
import ContextMenuPlugin from './plugins/ContextMenuPlugin/index';
import DragDropPaste from './plugins/DragDropPastePlugin/index';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin/index';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin/index';
import EmojisPlugin from './plugins/EmojisPlugin/index';
import ImagesPlugin from './plugins/ImagesPlugin/index';
import InlineImagePlugin from './plugins/InlineImagePlugin/index';
import KeywordsPlugin from './plugins/KeywordsPlugin/index';
import {LayoutPlugin} from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin/index';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin/index';
import {MaxLengthPlugin} from './plugins/MaxLengthPlugin/index';
import MentionsPlugin from './plugins/MentionsPlugin/index';
import PageBreakPlugin from './plugins/PageBreakPlugin/index';
import TabFocusPlugin from './plugins/TabFocusPlugin/index';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin/index';
import TableCellResizer from './plugins/TableCellResizer/index';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin/index';
import ToolbarPlugin from './plugins/ToolbarPlugin/index';
import TwitterPlugin from './plugins/TwitterPlugin/index';
import YouTubePlugin from './plugins/YouTubePlugin/index';
import ContentEditable from './ui/ContentEditable';

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {$generateHtmlFromNodes} from '@lexical/html'

const skipCollaborationInit =
  // @ts-expect-error
  window.parent != null && window.parent.frames.right === window;


  export default forwardRef(function Editor2(_, ref) {
  const {historyState} = useSharedHistoryContext();
  const [editor] = useLexicalComposerContext();
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      shouldPreserveNewLinesInMarkdown,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings();
  const isEditable = useLexicalEditable();
  const placeholder = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
    ? 'Enter some rich text...'
    : 'Enter some plain text...';
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };



  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);

    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  function SaveContent(){
    let htmlString;
    editor.update(() => {
      htmlString = $generateHtmlFromNodes(editor);
      // console.log(htmlString); // Store the HTML string in state
    });
    return htmlString;
  };

  useImperativeHandle(ref, () => ({
    saveContent: SaveContent, // Expose the SaveContent function
  }));
  return (
    <>
      {isRichText && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
      <div
        className={`editor-container ${
          !isRichText ? 'plain-text' : ''
        }`}>
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <AutoEmbedPlugin />

        <MentionsPlugin />
        <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <AutoLinkPlugin />

            {isCollab ? (
              <CollaborationPlugin
                id="main"
                providerFactory={createWebsocketProvider}
                shouldBootstrap={!skipCollaborationInit}
              />
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )}
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef} onChange={(e) => console.log((e.target as HTMLInputElement).value)}>
                    <ContentEditable placeholder={placeholder}/>
                  </div>
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}

            />
            <ListPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
            />
            <TableCellResizer />
            <ImagesPlugin />
            <InlineImagePlugin />
            <LinkPlugin />
            <TwitterPlugin />
            <YouTubePlugin />
            <ClickableLinkPlugin disabled={isEditable} />
            <HorizontalRulePlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
            <PageBreakPlugin />
            <LayoutPlugin />
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <TableCellActionMenuPlugin
                  anchorElem={floatingAnchorElem}
                  cellMerge={true}
                />
              </>
            )}
            
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
            maxLength={5}
          />
        )}
       <ContextMenuPlugin />
      </div>
    </>
  );

});
