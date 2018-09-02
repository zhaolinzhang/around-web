import React from 'react';
import { Modal, Button, message } from 'antd';
import $ from 'jquery';
import { WrappedCreatePostForm } from './CreatePostForm';
import {API_ROOT, AUTH_PREFIX, POS_KEY, TOKEN_KEY} from '../constants';

export class CreatePostButton extends React.Component {
    state = {
        visible: false,
        confirmLoading: false,
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    }

    handleOk = () => {
        this.form.validateFields((errors, values) => {
            if (!errors) {

                this.setState({ confirmLoading: true });

                const { latitude, longitude } = JSON.parse(localStorage.getItem(POS_KEY));
                const token = localStorage.getItem(TOKEN_KEY);

                const formData = new FormData();
                formData.set('lat', latitude);
                formData.set('lon', longitude);
                formData.set('message', values.message);
                formData.set('image', values.image[0].originFileObj);

                $.ajax({
                    url: `${API_ROOT}/post`,
                    method: 'POST',
                    data: formData,
                    headers: {
                        Authorization: `${AUTH_PREFIX} ${token}`,
                    },
                    processData: false,
                    contentType: false,
                    dataType: 'text',
                }).then(() => {
                    this.form.resetFields();
                    message.success('Successfully created a post');
                    this.setState({ visible: false, confirmLoading: false });
                    this.props.loadNearbyPosts();
                }, () => {
                    message.error('Failed to create a post');
                    this.setState({ confirmLoading: false });
                }).catch((e) => {
                    console.log(e);
                });
            }

        });
    }

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visible: false,
        });
    }

    saveFromRef = (formInstance) => {
        this.form = formInstance;
    }

    render() {
        const { visible, confirmLoading } = this.state;
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>Create New Post</Button>
                <Modal title="Create New Post"
                       visible={visible}
                       onOk={this.handleOk}
                       okText="Create"
                       confirmLoading={confirmLoading}
                       onCancel={this.handleCancel}
                >
                    <WrappedCreatePostForm ref={this.saveFromRef}/>
                </Modal>
            </div>
        );
    }
}
