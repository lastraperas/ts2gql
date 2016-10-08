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
    _.map(docs.tags, (t:any, i) => {
      if(t.title === 'graphql') {
        annotations = _.union(annotations, t.description.split(' '))
      }
      if(t.title === 'param') {
        if(t.type.type === 'NameExpression') {
          annotations = [t.type.name]
        } else if(t.type.type === 'ArrayType') {
          annotations = _.map(t.type.elements, (e:any) => e.name)
        }
      }
      if(t.title === 'required' || t.title === 'float') {
        annotations = [t.title]
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
