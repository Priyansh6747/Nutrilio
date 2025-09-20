import {View, Text} from 'react-native'
import React, {useEffect, useState} from 'react'
import Config from "../../utils/Config";
import Loader from "../Loader";
import ImagePost from "./ImagePost";
import PublicText from "./PublicText";

const FeedItem = ({feedID}) => {
    const [loading, setLoading] = useState(true);
    const [feedData, setFeedData] = useState(null);

    const loadPost = async () => {
        try {
            const URL = Config.BaseURL + '/api/v1/post/feed/post/' + feedID;
            let response = await fetch(URL);
            if (!response.ok)
                throw Error(response.statusText);
            let data = await response.json();
            console.log('API Response:', data); // Log the actual API response
            setFeedData(data);
        } catch(err) {
            console.log('Error loading post:', err);
        }
    }

    useEffect(() => {
        loadPost().then(() => {
            setLoading(false);
        });
    }, [])

    useEffect(() => {
        console.log('Loaded feedData:', feedData)
    }, [feedData])

    const renderPost = (feedData) => {
        if (!feedData) return null;

        switch (feedData.postType) {
            case 'public':
                if (feedData.mediaUrl != null)
                    return <ImagePost data={feedData} />
                else
                    return <PublicText data={feedData} />
            default:
                return <Text>Unknown post type: {feedData.postType}</Text>;
        }
    }

    if (loading)
        return <Loader/>

    return (
        <View>
            {renderPost(feedData)}
        </View>
    )
}

export default FeedItem