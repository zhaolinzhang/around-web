import React from 'react';
import $ from 'jquery';
import { Tabs, Spin } from 'antd';
import { GEO_OPTIONS, POS_KEY, API_ROOT, TOKEN_KEY, AUTH_PREFIX } from '../constants';
import { Gallery } from './Gallery';
import {CreatePostButton} from './CreatePostButton';

export class Home extends React.Component {

    state = {
        loadingGeoLocation: false,
        loadingPosts: false,
        error: '',
        posts: []
    }

    componentDidMount() {
        this.setState({ loadingGeoLocation: true, error: '' });
        this.getGeoLocation();
    }

    getGeoLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS
            );
        } else {
            this.setState({ error: "Your browser does not support geolocation!" });
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({latitude, longitude}));
        this.setState({ loadingGeoLocation: false, error: ''})
        this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = () => {
        this.setState({ loadingGeoLocation: false, error: "Failed to get user location" });
    }

    getGalleryPanelContent = () => {
        if (this.state.error) {
            return <div>{this.state.error}</div>
        } else if (this.state.loadingGeoLocation) {
            return <Spin tip="Loading Geo location..."/>;
        } else if (this.state.loadingPosts) {
            return <Spin tip="Loading posts..."/>;
        } else if (this.state.posts && this.state.posts.length > 0) {
            const images = this.state.posts.map(({user, message, url}) => {
                return {
                    user,
                    caption: message,
                    src: url,
                    thumbnail: url,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                };
            });
            return (
                <div>
                    <Gallery images={images}/>
                </div>
            );
        } else {
            return null;
        }
    }

    loadNearbyPosts = () => {
        const { latitude, longitude } = JSON.parse(localStorage.getItem(POS_KEY));
        this.setState({ loadingPosts: true });
        $.ajax({
            url: `${API_ROOT}/search?lat=${latitude}&lon=${longitude}&range=2000000`,
            method: 'GET',
            headers: {
                Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`
            }
        }).then((posts) => {
            console.log(posts);
            this.setState({ loadingPosts: false, error: '', posts });
        }, (error) => {
            this.setState({ loadingPosts: false, error: error.responseText });
        });
    }

    render() {
        const TabPane = Tabs.TabPane;
        const operations = <CreatePostButton type="primary">Create New Post</CreatePostButton>;
        return (
            <Tabs tabBarExtraContent={operations} className="main-tabs">
                <TabPane tab="Posts" key="1">{this.getGalleryPanelContent()}</TabPane>
                <TabPane tab="Video Posts" key="2">Content of tab 2</TabPane>
                <TabPane tab="Map" key="3">Content of tab 3</TabPane>
            </Tabs>
        );
    }
}