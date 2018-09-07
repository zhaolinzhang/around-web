import React from 'react';
import $ from 'jquery';
import { Tabs, Spin, Row, Col, Radio } from 'antd';
import { GEO_OPTIONS, POS_KEY, API_ROOT, TOKEN_KEY, AUTH_PREFIX } from '../constants';
import { Gallery } from './Gallery';
import { CreatePostButton } from './CreatePostButton';
import { WrappedAroundMap } from './AroundMap';

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

export class Home extends React.Component {
    state = {
        loadingGeoLocation: false,
        loadingPost: false,
        error: '',
        posts: [],
        topic: 'around',
    }

    componentDidMount() {
        this.getGeoLocation();
    }

    getGeoLocation = () => {
        this.setState({ loadingGeoLocation: true, error: '' });
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS,
            );
        } else {
            this.setState({ error: 'Your browser does not support geolocation!' });
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        this.setState({ loadingGeoLocation: false, error: '' });
        console.log(position);
        const { latitude, longitude} = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({ lat: latitude, lon: longitude }));
        this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = (error) => {
        this.setState({ loadingGeoLocation: false, error: 'Failed to load geo location!' });
        console.log(error);
    }

    loadNearbyPosts = (location, range) => {
        this.setState({ loadingPosts: true, error: '' });
        const { lat, lon } = location ? location : JSON.parse(localStorage.getItem(POS_KEY));
        const radius = range ? range : 20;
        const endPoint = this.state.topic === 'around' ? 'search' : 'cluster';
        $.ajax({
            url: `${API_ROOT}/${endPoint}?lat=${lat}&lon=${lon}&range=${radius}&term=${this.state.topic}`,
            method: 'GET',
            headers: {
                Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`,
            },
        }).then((response) => {
            console.log(response);
            this.setState({ posts: response || [],loadingPosts: false, error: '' });
        }, (response) => {
            console.log(response.responseText);
            this.setState({ loadingPosts: false, error: 'Failed to load posts!' });
        }).catch((error) => {
            console.log(error);
        });
    }

    getPanelContent = (type) => {
        if (this.state.error) {
            return <div>{this.state.error}</div>;
        } else if (this.state.loadingGeoLocation) {
            return <Spin tip="Loading geo location..."/>;
        } else if (this.state.loadingPosts) {
            return <Spin tip="Loading posts..."/>;
        } else if (this.state.posts && this.state.posts.length > 0) {
            if (type === 'image') {
                return this.getImagePosts();
            } else {
                return this.getVideoPosts();
            }
        } else {
            return <div>Found nothing...</div>;
        }
    }

    getImagePosts = () => {
        const images = this.state.posts
            .filter((post) => post.type === 'image')
            .map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    caption: post.message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                };
            });
        return <Gallery images={images}/>;
    }

    getVideoPosts = () => {
        return (
            <Row gutter={24}>
                {
                    this.state.posts
                        .filter((post) => post.type === 'video')
                        .map((post) => (
                            <Col span={6} key={post.url}>
                                <video src={post.url} controls={true} className="video-block"></video>
                            </Col>
                        ))
                }
            </Row>
        );
    }

    onTopicChange = (e) => {
        this.setState({ topic: e.target.value }, this.loadNearbyPosts);
    }

    render() {
        const operations = <CreatePostButton loadNearbyPosts={this.loadNearbyPosts}/>;

        return (
            <div className="main-tabs">
                <RadioGroup className="topic-radio-group" value={this.state.topic} onChange={this.onTopicChange}>
                    <Radio value="around">Posts Around Here</Radio>
                    <Radio value="face">Faces Around The World</Radio>
                </RadioGroup>
                <Tabs tabBarExtraContent={operations}>
                    <TabPane tab="Image Posts" key="1">
                        {this.getPanelContent('image')}
                    </TabPane>
                    <TabPane tab="Video Posts" key="2">
                        {this.getPanelContent('video')}
                    </TabPane>
                    <TabPane tab="Map" key="3">
                        <WrappedAroundMap
                            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyD3CEh9DXuyjozqptVB5LA-dN7MxWWkr9s&v=3.exp&libraries=geometry,drawing,places"
                            loadingElement={<div style={{ height: `100%` }} />}
                            containerElement={<div style={{ height: `600px` }} />}
                            mapElement={<div style={{ height: `100%` }} />}
                            posts={this.state.posts}
                            loadNearbyPosts={this.loadNearbyPosts}
                        />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
