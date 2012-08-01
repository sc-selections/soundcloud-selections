/**
 * Configuration Settings for SoundCloud Selections
 * 
 * 
 * Includes:
 * - SoundCloud API client ID and redirect URI
 * - Default Music Genre Definitions
 * - Default Music Selection Definitions
 * - Bookmarklet description & code
 * 
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.Config = SelectionsApp.Config || {};

SelectionsApp.Config = (function() {
    
    var config = {};
    
    config.getSoundCloudClientId = function()
    {
        return "28228715975e988fdd0640c1effb1de8";
    };

    config.getSoundCloudRedirectUri = function()
    {
        return "http://selections.musicwishlists.com";
    };

    config.getDefaultGenres = function()
    {
        return [  { title: 'African' },
                  { title: 'Asian' }, 
                  { title: 'Blues' }, 
                  { title: 'Country' }, 
                  { title: 'Electronic' }, 
                  { title: 'Folk' }, 
                  { title: 'Hip-Hop' }, 
                  { title: 'Jazz' }, 
                  { title: 'Pop' }, 
                  { title: 'R&B' }, 
                  { title: 'Rock' }, 
                  { title: 'Ska' } 
        ];
    };

    config.getDefaultSelections = function()
    {
        return [ 
             { title: "Newest Tracks",        path: '/tracks',       options: { order: "created_at" } },
             { title: "Hottest Tracks",       path: '/tracks',       options: { order: "hotness" } },                 
             { title: "Popular Remixes",      path: '/tracks',       options: { order: "hotness", types: "remix" } },
             { title: "Recent Remixes",       path: '/tracks',       options: { order: "created_at", types: "remix" } },
             { title: "My SoundCloud Tracks", path: '/me/tracks',    options: { limit: 100 } },
             { title: "My SoundCloud Favs",   path: '/me/favorites', options: { limit: 100 } }
        ];
        
    };
    
    config.getBookmarkletDescription = function()
    {
        var message = "Drag the button below onto your toolbar to bookmark tracks while browsing SoundCloud.";
        return message;
    };
    
    config.getBookmarkletLink = function()
    {
        /* Bookmarklet Implementation
           --------------------------  
         
           Approach:
          
                Select all SoundCloud data-sc-track attributes and grab the track id value.

           Code:
           
                var t=document.querySelectorAll('[data-sc-track]'); 
                var s=''; 
                
                for( var i = 0; i < t.length; i++ ) { 
                    s += t[i].getAttribute('data-sc-track') + (i !== t.length-1 ? ',':''); 
                } 
                
                if( t.length === 0 ) { 
                    alert('No SoundCloud tracks found') 
                } else { 
                    window.open( 'http://selections.musicwishlists.com/bookmark.html?t=' + s, '_self') 
                };
         */
        
        var link = 'javascript:' + escape("var t=document.querySelectorAll('[data-sc-track]'); var s=''; for( var i = 0; i < t.length; i++ ) { s += t[i].getAttribute('data-sc-track') + (i !== t.length-1 ? ',':''); } if( t.length === 0 ) { alert('No SoundCloud tracks found.') } else { window.open( 'http://selections.musicwishlists.com/bookmark.html?t=' + s, '_self') };");
        return link;
    };
    
    config.addBookmarks = function( url )
    {
        var oldTrackIds,
            newTrackIds,
            param,
            value;
        
        param = url.substr( url.indexOf('?t=') + 3 );
        
        if( param ) {

            oldTrackIds = config.getBookmarks();
            newTrackIds = oldTrackIds.concat( param.split( ',' ) );
            
            value = newTrackIds.join();
                        
            setCookie( 'sc-selections-bookmarks', value );
        }
    };
    
    config.getBookmarks = function()
    {
        var value = getCookie( 'sc-selections-bookmarks' );
        return value ? value.split(',') : [];
    };
    
    config.clearBookmarks = function()
    {
        eraseCookie( 'sc-selections-bookmarks' );
    };
    


    //-------------------------------------------------------------------------
    // Cookie Management Helper Methods
    //-------------------------------------------------------------------------
    
    function setCookie( name, value, hours, domain, path )
    {
        var cookie_string = escape( name ) + '=' + escape( value );
        
        if( hours ) {
            var cookie_date = new Date();
            cookie_date.setTime( cookie_date.getTime() + hours * 60 * 60 * 1000 );
            cookie_string += "; expires=" + cookie_date.toGMTString();
        }
        
        if( domain ) {
            cookie_string += '; domain=' + domain;  
        }
        
        cookie_string += path ? '; path=' + path : '; path=/';
        
        document.cookie = cookie_string;
    }
    
    function getCookie( name )
    {
        var results = document.cookie.match ( '(^|;) ?' + escape( name ) + '=([^;]*)(;|$)' );   
        return results ? unescape( results[2] ) : null;
    }
    
    function eraseCookie( name ) 
    {
        setCookie( name, "", -1 );
    }
        

    return config;
})();