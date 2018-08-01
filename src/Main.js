import React from 'react';
import { WrappedRegistrationForm } from './Register';

export class Main extends React.Component {
    render() {
        return (
            <div className='main'>
                <WrappedRegistrationForm/>
            </div>
        );
    }
}