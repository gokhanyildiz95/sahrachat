import React from 'react';
import { Link } from 'react-router-dom';
import Highlight, { defaultProps } from 'prism-react-renderer';
import { Line, Paragraph, BlockQuote } from '../../components/Message/style';
import {
  AspectRatio,
  EmbedContainer,
  EmbedComponent,
} from '../../components/rich-text-editor/style';
import ThreadAttachment from '../../components/Message/threadAttachment';
import { getStringElements } from '../utils/getStringElements';
import { hasStringElements } from '../utils/hasStringElements';
import mentionsDecorator from '../mentions-decorator';
import linksDecorator from '../links-decorator';
import { SPECTRUM_URLS } from '../../shared/regexps';
// import { KeyObj, KeysObj, DataObj } from '../message/types';

const ExternalEmbed = (props) => {
  let { aspectRatio, url, src, width = '100%', height = 200 } = props;

  if (!src && url) src = url;
  if (typeof src !== 'string') return null;

  // if an aspect ratio is passed in, we need to use the EmbedComponent which does some trickery with padding to force an aspect ratio. Otherwise we should just use a regular iFrame
  if (aspectRatio && aspectRatio !== undefined) {
    return (
      <AspectRatio style={{ height }} ratio={aspectRatio}>
        <EmbedComponent
          title={`iframe-${src}`}
          width={width}
          height={height}
          allowFullScreen={true}
          frameBorder="0"
          src={src}
        />
      </AspectRatio>
    );
  } else {
    return (
      <EmbedContainer style={{ height }}>
        <iframe
          title={`iframe-${src}`}
          width={width}
          height={height}
          allowFullScreen={true}
          frameBorder="0"
          src={src}
        />
      </EmbedContainer>
    );
  }
};

const InternalEmbed = (props) => {
  if (props.entity !== 'thread') return null;

  return <ThreadAttachment id={props.id} />;
};

const Embed = (props) => {
  if (props.type === 'internal') {
    return <InternalEmbed {...props} />;
  }

  return <ExternalEmbed {...props} />;
};


export const createRenderer = (options) => {
  return {
    inline: {
      BOLD: (children, { key }) => (
        <span style={{ fontWeight: 700 }} key={key}>
          {children}
        </span>
      ),
      ITALIC: (children, { key }) => (
        <em key={key}>{children}</em>
      ),
      CODE: (children, { key }) => (
        <code key={key}>{children}</code>
      ),
    },
    blocks: {
      unstyled: (children, { keys }) => {
        // If the children are text, render a paragraph
        if (hasStringElements(children)) {
          return children.map((child, index) => (
            <Paragraph key={keys[index]}>{child}</Paragraph>
          ));
        }

        return children;
      },
      'code-block': (children, { keys, data }) => {
        return children.map((child, index) => (
          <Highlight
            {...defaultProps}
            code={getStringElements(child).join('\n')}
            language={Array.isArray(data) && data[0].language}
            theme={undefined}
            key={keys[index]}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <Line className={className} style={style}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </div>
                ))}
              </Line>
            )}
          </Highlight>
        ));
      },
      blockquote: (children, { keys }) =>
        children.map((child, index) => (
          <BlockQuote key={keys[index] || index}>{child}</BlockQuote>
        )),
      ...(!options.headings
        ? {}
        : {
            'header-one': (children, { keys }) =>
              children.map((child, index) => (
                <h1 key={keys[index]}>{child}</h1>
              )),
            'header-two': (children, { keys }) =>
              children.map((child, index) => (
                <h2 key={keys[index]}>{child}</h2>
              )),
            'header-three': (children, { keys }) =>
              children.map((child, index) => (
                <h3 key={keys[index]}>{child}</h3>
              )),
          }),
      'unordered-list-item': (children, { keys }) => (
        <ul key={keys.join('|')}>
          {children.map((child, index) => (
            <li key={keys[index]}>{child}</li>
          ))}
        </ul>
      ),
      'ordered-list-item': (children, { keys }) => (
        <ol key={keys.join('|')}>
          {children.map((child, index) => (
            <li key={keys[index]}>{child}</li>
          ))}
        </ol>
      ),
    },
    entities: {
      LINK: (children, data, { key }) => {
        const link = data.url || data.href;

        if (link) {
          const regexp = new RegExp(SPECTRUM_URLS, 'ig');
          const match = regexp.exec(link);
          if (match && match[0] && match[1]) {
            return <Link to={match[1]}>{children}</Link>;
          }
        }

        return (
          <a key={key} href={link} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      },
      IMAGE: (
        children,
        data,
        { key }
      ) => <img key={key} src={data.src} alt={data.alt || 'Image'} />,
      embed: (children, data, { key }) => (
        <Embed key={key} {...data} />
      ),
    },
    decorators: [mentionsDecorator, linksDecorator],
  };
};