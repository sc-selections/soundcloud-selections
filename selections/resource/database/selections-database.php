<?php

/**
 * Light-weight access to a SQL database for SoundCloud Selections
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

class SelectionsDatabase
{       
    const table_search = 'search';
    const table_playlist = 'playlist';
    const table_playlist_track = 'playlist_track';



    //-------------------------------------------------------------------------
    // Database Playlist APIs
    //-------------------------------------------------------------------------

    public static function addPlaylist( $userId, $title, $description )
    {
        if( !$userId || !$title || !$description ) { return false; };

        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        $userId = mysqli_real_escape_string( $dbHandle, $userId );
        $title = mysqli_real_escape_string( $dbHandle, $title );
        $description = mysqli_real_escape_string( $dbHandle, $description );
                
        $table = SelectionsDatabase::table_playlist;
        $query = "INSERT INTO $table (uid,title,description) VALUES ('$userId','$title','$description')";
        
        $success = SelectionsDatabase::database_query( $dbHandle, $query );
        
        return $success ? mysqli_insert_id( $dbHandle ) : false;
    }
    
    public static function updatePlaylist( $userId, $playlistId, $title, $description )
    {
        if( !$userId || !$title || !$description ) { return false; };

        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        $userId = mysqli_real_escape_string( $dbHandle, $userId );
        $title = mysqli_real_escape_string( $dbHandle, $title );
        $description = mysqli_real_escape_string( $dbHandle, $description );
                
        $table = SelectionsDatabase::table_playlist;
        $query = "UPDATE $table SET title='$title',description='$description' WHERE uid='$userId' AND id='$playlistId'";
        
        $success = SelectionsDatabase::database_query( $dbHandle, $query );
        
        return $success ? true : false;
    }   
        
    public static function deletePlaylist( $userId, $playlistId )
    {
        if( !$userId || !$playlistId ) { return false; };

        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        $userId = mysqli_real_escape_string( $dbHandle, $userId );
        $searchText = mysqli_real_escape_string( $dbHandle, $searchText );
                
        $table = SelectionsDatabase::table_playlist;
        $query = "DELETE FROM $table WHERE uid='$userId' AND id='$playlistId'";
        
        $success = SelectionsDatabase::database_query( $dbHandle, $query );
        
        return $success ? true : false;
    }
    
    
    public static function addPlaylistTracks( $playlistId, $trackIds )
    {
        if( !$playlistId || !$trackIds ) { return false; };

        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        
        $playlistId = mysqli_real_escape_string( $dbHandle, $playlistId );
        
        $table = SelectionsDatabase::table_playlist_track;


        $queries = array();
        
        $numTracks = count( $trackIds );
        
        for( $i = 0; $i < $numTracks; $i++ ) {
            
            $trackId = mysqli_real_escape_string( $dbHandle, $trackIds[$i] );
            $queries[] = "INSERT INTO $table (playlist_id,track_id) VALUES ('$playlistId','$trackId')";
        }
                              
        $success = SelectionsDatabase::database_multi_query( $dbHandle, $queries );
        
        return $success ? mysqli_insert_id( $dbHandle ) : false;
    }       
    
    public static function removePlaylistTrack( $id, $playlistId, $trackId )
    {
        if( !$id || !$playlistId || !$trackId ) { return false; };

        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        $id = mysqli_real_escape_string( $dbHandle, $id );
        $playlistId = mysqli_real_escape_string( $dbHandle, $playlistId );
        $trackId = mysqli_real_escape_string( $dbHandle, $trackId );
                
        $table = SelectionsDatabase::table_playlist_track;
        $query = "DELETE FROM $table WHERE playlist_id='$playlistId' AND track_id='$trackId'";
        
        $success = SelectionsDatabase::database_query( $dbHandle, $query );
        
        return $success ? true : false;
    }           
    
    
    public static function getPlaylists( $userId )
    {
        if( !$userId ) { return false; };

        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        $userId = mysqli_real_escape_string( $dbHandle, $userId );
                
        $table = SelectionsDatabase::table_playlist;
        $query = "SELECT id,title,description FROM $table WHERE uid='$userId' ORDER BY title";
        
        $results = SelectionsDatabase::database_query( $dbHandle, $query );


        $playlists = array();
        
        while( $row = mysqli_fetch_assoc($results) ) {            
            array_push( $playlists, $row );
        }
        
        mysqli_free_result( $results );
                                        
        return $playlists;  
    }
    
    public static function getPlaylistTracks( $playlistId )
    {
        if( !$playlistId ) { return false; };

        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        $userId = mysqli_real_escape_string( $dbHandle, $userId );
                
        $table = SelectionsDatabase::table_playlist_track;
        $query = "SELECT id,playlist_id,track_id FROM $table WHERE playlist_id='$playlistId' ORDER BY id";
        
        $results = SelectionsDatabase::database_query( $dbHandle, $query );


        $playlistTracks = array();
        
        while( $row = mysqli_fetch_assoc($results) ) {            
            array_push( $playlistTracks, $row );
        }
        
        mysqli_free_result( $results );
                                        
        return $playlistTracks;  
    }       
    
    
    
    
    //-------------------------------------------------------------------------
    // Database Search History APIs
    //-------------------------------------------------------------------------

    public static function addSearchEntry( $userId, $searchText )
    {
        if( !$userId || !$searchText ) { return false; };

        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        $userId = mysqli_real_escape_string( $dbHandle, $userId );
        $searchText = mysqli_real_escape_string( $dbHandle, $searchText );
                
        $table = SelectionsDatabase::table_search;
        $query = "INSERT INTO $table (uid,query) VALUES ('$userId','$searchText')";
        
        $success = SelectionsDatabase::database_query( $dbHandle, $query );
        
        return $success ? mysqli_insert_id( $dbHandle ) : false;
    }
    
    public static function deleteSearchEntry( $userId, $searchId )
    {
        if( !$userId || !$searchId ) { return false; };

        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        $userId = mysqli_real_escape_string( $dbHandle, $userId );
        $searchText = mysqli_real_escape_string( $dbHandle, $searchText );
                
        $table = SelectionsDatabase::table_search;
        $query = "DELETE FROM $table WHERE uid='$userId' AND id='$searchId'";
        
        $success = SelectionsDatabase::database_query( $dbHandle, $query );
        
        return $success ? true : false;
    }   
    
    public static function getSearchEntries( $userId )
    {
        $dbHandle = SelectionsDatabase::getDatabaseHandle();
        
        $userId = mysqli_real_escape_string( $dbHandle, $userId );
        $offset = mysqli_real_escape_string( $dbHandle, $offset );
        $limit = mysqli_real_escape_string( $dbHandle, $limit );
        
        $table = SelectionsDatabase::table_search;
        $query = "SELECT id,query FROM $table WHERE uid='$userId' ORDER BY timestamp DESC";       
        
        $results = mysqli_query( $dbHandle, $query );
        
        
        $searchHistory = array();
        
        while( $row = mysqli_fetch_assoc($results) ) {            
            array_push( $searchHistory, $row );
        }
        
        mysqli_free_result( $results );
                                        
        return $searchHistory;      
    }   
    
    
    
    
    //-------------------------------------------------------------------------
    // Database Private Methods
    //-------------------------------------------------------------------------
    
    private static function database_query( $database_handle, $query )
    {
        $results = mysqli_query( $database_handle, $query );
        
        if( !$results ) {
            die( 'database error: ' . mysqli_error( $database_handle ) );
        } 
        
        return $results;
    }   
    
    private static function database_multi_query( $database_handle, $queries )
    {
        $query = implode( ";", $queries );
        $results = mysqli_multi_query( $database_handle, $query );
        
        if( !$results ) {
            die( 'database error: ' . mysqli_error( $database_handle ) );
        } 
        
        return $results;
    }   
    
    private static function getDatabaseHandle()
    {
        $username = "guest_selections";
        $password = "m1y4vkR9";
        $host     = "mysql.selections.musicwishlists.com";
        $port     = 3306;
        $dbname   = "selections_data";
        
        return mysqli_connect( $host, $username, $password, $dbname, $port );
    }           
}

?>