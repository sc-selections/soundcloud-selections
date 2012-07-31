<?php

/**
 * A Simple HTTP Request Handler for SoundCloud Selections
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

include_once( 'database/selections-database.php' );

$userId = getPostValue( "user_id" );
$action = getPostValue( "action" );

$result = null;

switch( $action )
{
	
	/* Database Playlist Calls */
	
	case 'get_playlists':
		$result = SelectionsDatabase::getPlaylists( $userId );
		break;

    case 'add_playlist':
		$title = getPostValue( "title" );
		$description = getPostValue( "description" );
        $result = SelectionsDatabase::addPlaylist( $userId, $title, $description );
        break;

    case 'update_playlist':
		$playlistId = getPostValue( "playlist_id" );
        $title = getPostValue( "title" );
        $description = getPostValue( "description" );
        $result = SelectionsDatabase::updatePlaylist( $userId, $playlistId, $title, $description );
        break;

    case 'delete_playlist':
        $playlistId = getPostValue( "playlist_id" );
        $result = SelectionsDatabase::deletePlaylist( $userId, $playlistId );
        break;


    /* Database Playlist Track Calls */

    case 'get_playlist_tracks':
		$playlistId = getPostValue( "playlist_id" );
        $result = SelectionsDatabase::getPlaylistTracks( $playlistId );
        break;
		
    case 'add_playlist_tracks':
        $playlistId = getPostValue( "playlist_id" );
		$trackIdList = getPostValue( "track_ids" );
		$trackIds = explode( ',', $trackIdList );        
        $result = SelectionsDatabase::addPlaylistTracks( $playlistId, $trackIds );			
        break;

    case 'remove_playlist_track':
		$id = getPostValue( "id" );
        $playlistId = getPostValue( "playlist_id" );
		$trackId = getPostValue( "track_id" );
        $result = SelectionsDatabase::removePlaylistTrack( $id, $playlistId, $trackId );
        break;


    /* Database Search Calls */
	
    case 'get_search_entries':
        $result = SelectionsDatabase::getSearchEntries( $userId );
        break;

    case 'add_search_entry':
		$query = getPostValue( "query" );
        $result = SelectionsDatabase::addSearchEntry( $userId, $query );
        break;

    case 'delete_search_entry':
        $id = getPostValue( "id" );
        $result = SelectionsDatabase::deleteSearchEntry( $userId, $id );
        break;

}

$response = array();

if( $result || is_array($result) ) {
    $response["status"] = 1;
    $response["data"] = $result;
} else {
    $response["status"] = 0;
}

echo json_encode( $response );


function getPostValue( $index )
{
    return isset( $_POST[$index] ) && $_POST[$index] !== 'null' ? $_POST[$index] : null;
}

//$results = SelectionsDatabase::getPlaylists( '1' );

//$results = SelectionsDatabase::getPlaylistTracks( '2' );

//$results = SelectionsDatabase::getSearchEntries( '1' );

//SelectionsDatabase::removePlaylistTrack( '2', '2', '9876' );

//SelectionsDatabase::addPlaylistTrack( '2', '9876' );

//SelectionsDatabase::deletePlaylist( '1', '1' );

//SelectionsDatabase::addPlaylist( '1', "Canadian Places", "Favorite Songs Across Canada" );

//SelectionsDatabase::updatePlaylist( '1', '1', "Canadian Places OLD", "Favorite Songs Across Canada OLD" );

//SelectionsDatabase::addSearchEntry( '1', "Ontario" );


?>