'use strict';

const version = 'v0.05::';
const staticCacheName = version + 'static';

function updateStaticCache() {
    return caches.open(staticCacheName)
        .then( cache => {
            // These items won't block the installation of the Service Worker
            cache.addAll([
                '/css/fonts/OpenSans-Regular.woff',
                '/css/fonts/OpenSans-Semibold.woff',
                '/css/fonts/OpenSans-Italic.woff',
                '/icon.png'
            ]);
            // These items must be cached for the Service Worker to complete installation
            return cache.addAll([
                '/fr/',
                '/fr/introduction/',
                '/fr/le-projet-gutenberg/resume/',
                '/fr/le-projet-gutenberg/les-mille-premiers-livres/',
                '/fr/le-projet-gutenberg/de-mille-a-dix-mille-livres/',
                '/fr/le-projet-gutenberg/de-dix-mille-a-vingt-mille-livres/',
                '/fr/le-projet-gutenberg/de-vingt-mille-a-cinquante-mille-livres/',
                '/fr/le-projet-gutenberg/chronologie-du-projet-gutenberg/',
                '/fr/hors-ligne/',
                '/fr/le-web-booste-l-internet/resume/',
                '/fr/le-web-booste-l-internet/les-composantes-techniques-du-reseau/',
                '/fr/le-web-booste-l-internet/le-reve-derriere-le-web/',
                '/fr/le-web-booste-l-internet/du-bas-debit-au-haut-debit/',
                '/fr/le-web-booste-l-internet/un-espace-de-liberte/',
                '/fr/le-web-booste-l-internet/un-espace-de-connaissance/',
                '/fr/le-web-booste-l-internet/un-espace-participatif/',
                '/fr/le-web-booste-l-internet/le-web-2-0/',
                '/fr/le-web-booste-l-internet/l-accessibilite-du-web/',
                '/fr/le-web-booste-l-internet/la-preservation-de-l-internet/',
                '/fr/l-unicode/resume/',
                '/fr/l-unicode/l-ascii/',
                '/fr/l-unicode/l-unicode/',
                '/fr/des-repertoires-de-textes-electroniques/resume/',
                '/fr/des-repertoires-de-textes-electroniques/les-etext-archives/',
                '/fr/des-repertoires-de-textes-electroniques/l-e-zine-list/',
                '/fr/l-online-books-page/',
                '/fr/le-format-pdf/resume/',
                '/fr/la-presse-imprimee-se-met-en-ligne/resume/',
                '/fr/la-presse-imprimee-se-met-en-ligne/quelques-exemples/',
                '/fr/la-presse-imprimee-se-met-en-ligne/le-metier-de-journaliste-change/',
                '/fr/le-livre-numerique-gratuit-comme-outil-de-marketing/resume/',
                '/fr/les-premieres-bibliotheques-numeriques/resume/',
                '/fr/les-premieres-bibliotheques-numeriques/abu/',
                '/fr/les-premieres-bibliotheques-numeriques/athena/',
                '/fr/les-premieres-bibliotheques-numeriques/lisieux/',
                '/fr/les-premieres-bibliotheques-numeriques/les-enleminures-de-la-bibliotheque-de-lyon/',
                '/fr/les-premieres-bibliotheques-numeriques/bibliotheque-numerique-une-definition/',
                '/fr/les-premieres-bibliotheques-numeriques/numerisation/',
                '/fr/l-internet-dans-les-bibliotheques/resume/',
                '/fr/l-internet-dans-les-bibliotheques/arpals/',
                '/fr/l-internet-dans-les-bibliotheques/la-cyberespace-de-la-bibliotheque-des-nations-unies/',
                '/fr/l-internet-dans-les-bibliotheques/l-epn-d-hermanville-sur-mer/',
                '/fr/l-internet-dans-les-bibliotheques/les-bibliotheques-et-l-internet/',
                '/css/style.css'
            ]);
        });
}

// Remove caches whose name is no longer valid
function clearOldCaches() {
    return caches.keys()
        .then( keys => {
            return Promise.all(keys
                .filter(key => key.indexOf(version) !== 0)
                .map(key => caches.delete(key))
            );
        });
}

self.addEventListener('install', event => {
    event.waitUntil(updateStaticCache()
        .then( () => self.skipWaiting() )
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(clearOldCaches()
        .then( () => self.clients.claim() )
    );
});

self.addEventListener('fetch', event => {
    let request = event.request;
    // Look in the cache first, fall back to the network
    event.respondWith(
        caches.match(request)
            .then(response => {
                // CACHE
                return response || fetch(request)
                    .then( response => {
                        // NETWORK
                        return response;
                    })
                    .catch( () => {
                        // OFFLINE
                        // If the request is for an image, show an offline placeholder
                        if (request.headers.get('Accept').indexOf('image') !== -1) {
                            return new Response('<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Hors ligne</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">Hors ligne</tspan></text></g></svg>', {headers: {'Content-Type': 'image/svg+xml'}});
                        }
                        // If the request is for a page, show an offline message
                        if (request.headers.get('Accept').indexOf('text/html') !== -1) {
                            return caches.match('/fr/hors-ligne/index.html');
                        }
                    });
            })
    );
});
