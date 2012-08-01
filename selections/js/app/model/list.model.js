/**
 * The List Model definition for SoundCloud Selections.
 * 
 * This collection governs the individual items that are 
 * available in the app, including individual user playlists,
 * music selections, music genres, and search history entries.
 * 
 * The select listener is mainly intended for dynamic list items
 * which require custom handling outside of regular list collections.
 * 
 * All other list collection items leverage the events fired by their
 * respective collections.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.ListModel = Backbone.Model.extend({
    
    addSelectListener: function( callback )
    {
        this.on( 'select', callback );
    }
    
});