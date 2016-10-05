import * as _ from 'lodash';
import * as doctrine from 'doctrine';
import * as typescript from 'typescript';

export function documentationForNode(node:typescript.Node, source?:string):doctrine.ParseResult {
  source = source || node.getSourceFile().text;
  const commentRanges = typescript.getLeadingCommentRanges(source, node.getFullStart());
  // We only care about the closest comment to the node.
  const lastRange = _.last(commentRanges);
  if (!lastRange) return null;
  const comment = source.substr(lastRange.pos, lastRange.end - lastRange.pos).trim();

  return doctrine.parse(comment, {unwrap: true});
}

export function getAnnotationsFromDocs(docs:doctrine.ParseResult):string[] {
  let annotations = []
  if(docs && docs.tags) {
    _.map(docs.tags, (t) => {
      if(t.title === 'graphql') {
        annotations = _.union(annotations, t.description.split(' '))
      }
    })
  }
  return annotations
}

export function required(docs:doctrine.ParseResult): string {
  let annotations:string[] = [];
  if (docs) {
    annotations = getAnnotationsFromDocs(docs);
  }
  return _.includes(annotations,'required')? '!': ''
}