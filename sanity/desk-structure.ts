// sanity/desk-structure.ts
// Custom Studio desk including the D2L Backfill review pane.
import type { StructureBuilder } from 'sanity/structure';

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Articles')
        .id('articles-group')
        .child(
          S.list()
            .title('Articles')
            .items([
              S.listItem()
                .title('All articles')
                .id('articles-all')
                .child(S.documentTypeList('article').title('All articles')),
              S.listItem()
                .title('Backfill review · awaiting')
                .id('articles-awaiting')
                .child(
                  S.documentList()
                    .title('Awaiting review')
                    .filter('_type == "article" && defined(phaseSuggested) && !defined(phase)')
                    .apiVersion('2024-01-01')
                ),
              S.listItem()
                .title('Backfill review · recently tagged')
                .id('articles-tagged')
                .child(
                  S.documentList()
                    .title('Recently tagged')
                    .filter('_type == "article" && defined(phase)')
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    .apiVersion('2024-01-01')
                ),
              S.listItem()
                .title('Backfill review · untagged')
                .id('articles-untagged')
                .child(
                  S.documentList()
                    .title('Untagged (manual)')
                    .filter('_type == "article" && !defined(phase) && !defined(phaseSuggested)')
                    .apiVersion('2024-01-01')
                ),
            ])
        ),
      S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      S.listItem()
        .title('Tags')
        .id('tags')
        .child(
          S.list()
            .title('Tags')
            .items([
              S.documentTypeListItem('phaseTag').title('Phase'),
              S.documentTypeListItem('buyerTypeTag').title('Buyer Type'),
              S.documentTypeListItem('areaTag').title('Area'),
              S.documentTypeListItem('propertyTypeTag').title('Property Type'),
              S.documentTypeListItem('useCaseTag').title('Use Case'),
            ])
        ),
    ]);
