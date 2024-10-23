import React, { useImperativeHandle, forwardRef,useState, useEffect } from 'react';
import {$createLinkNode} from '@lexical/link';
import {$createListItemNode, $createListNode} from '@lexical/list';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {$createHeadingNode, $createQuoteNode} from '@lexical/rich-text';
import {$createParagraphNode, $createTextNode, $getRoot} from 'lexical';
import {SettingsContext, useSettings} from '../context/SettingsContext';
import {SharedAutocompleteContext} from '../context/SharedAutocompleteContext';
import {SharedHistoryContext} from '../context/SharedHistoryContext';
import Editor2 from './Editor2';
import PlaygroundNodes from '../nodes/PlaygroundNodes';
import DocsPlugin from './plugins/DocsPlugin';
import {TableContext} from './plugins/TablePlugin';
import TestRecorderPlugin from './plugins/TestRecorderPlugin';
import TypingPerfPlugin from './plugins/TypingPerfPlugin';
import Settings2 from './Settings';
import PlaygroundEditorTheme from '../themes/PlaygroundEditorTheme';
import Button from "./ui/Button2";
import ExampleTheme from './ExampleTheme';
import CustomOnChange from './plugins/CustomOnChange';


function $prepopulatedRichText() {
    const root = $getRoot();
    if (root.getFirstChild() === null) {
      const heading = $createHeadingNode('h1');
      heading.append($createTextNode('Welcome to the playground'));
      root.append(heading);
      const quote = $createQuoteNode();
      quote.append(
        $createTextNode(
          `In case you were wondering what the black box at the bottom is – it's the debug view, showing the current state of the editor. ` +
            `You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.`,
        ),
      );
      root.append(quote);
      const paragraph = $createParagraphNode();
      paragraph.append(
        $createTextNode('The playground is a demo environment built with '),
        $createTextNode('@lexical/react').toggleFormat('code'),
        $createTextNode('.'),
        $createTextNode(' Try typing in '),
        $createTextNode('some text').toggleFormat('bold'),
        $createTextNode(' with '),
        $createTextNode('different').toggleFormat('italic'),
        $createTextNode(' formats.'),
      );
      root.append(paragraph);
      const paragraph2 = $createParagraphNode();
      paragraph2.append(
        $createTextNode(
          'Make sure to check out the various plugins in the toolbar. You can also use #hashtags or @-mentions too!',
        ),
      );
      root.append(paragraph2);
      const paragraph3 = $createParagraphNode();
      paragraph3.append(
        $createTextNode(`If you'd like to find out more about Lexical, you can:`),
      );
      root.append(paragraph3);
      const list = $createListNode('bullet');
      list.append(
        $createListItemNode().append(
          $createTextNode(`Visit the `),
          $createLinkNode('https://lexical.dev/').append(
            $createTextNode('Lexical website'),
          ),
          $createTextNode(` for documentation and more information.`),
        ),
        $createListItemNode().append(
          $createTextNode(`Check out the code on our `),
          $createLinkNode('https://github.com/facebook/lexical').append(
            $createTextNode('GitHub repository'),
          ),
          $createTextNode(`.`),
        ),
        $createListItemNode().append(
          $createTextNode(`Playground code can be found `),
          $createLinkNode(
            'https://github.com/facebook/lexical/tree/main/packages/lexical-playground',
          ).append($createTextNode('here')),
          $createTextNode(`.`),
        ),
        $createListItemNode().append(
          $createTextNode(`Join our `),
          $createLinkNode('https://discord.com/invite/KmG4wQnnD9').append(
            $createTextNode('Discord Server'),
          ),
          $createTextNode(` and chat with the team.`),
        ),
      );
      root.append(list);
      const paragraph4 = $createParagraphNode();
      paragraph4.append(
        $createTextNode(
          `Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance :).`,
        ),
      );
      root.append(paragraph4);
    }
  }

  interface TestingEditor {
    value: string;
    onChange: (value: string) => void;
  }

  export const TestingEditor: React.FC<TestingEditor> = React.memo(
    function TestingEditor({ value, onChange}) {
    const {
        settings: {isCollab, emptyEditor, measureTypingPerf},
      } = useSettings();
    
      const initialConfig = {
        editorState: isCollab
          ? null
          : emptyEditor
          ? undefined
          : $prepopulatedRichText,
        namespace: 'Playground',
        nodes: [...PlaygroundNodes],
        onError: (error: Error) => {
          throw error;
        },
        theme: ExampleTheme,
      };


    
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell flex flex-col lg:w-[780px] md:w-[650px]">
              <Editor2/>
            </div>
            <CustomOnChange value={value} onChange={onChange} />
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
});

