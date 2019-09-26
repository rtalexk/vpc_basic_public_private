import fetch from 'isomorphic-unfetch';
import { handlePromise as hp } from '../utils';

import React from 'react'
import Head from 'next/head'

import User from '../components/user'
import ComputerIcon from '../components/computer.icon';

const Home = (props) => (
  <div className='home-page'>
    <Head>
      <title>Address Book</title>
    </Head>

    <div className='wrapper'>
      <div className='directory'>
        <div className='panel'>
          <div className='header'>
            <h1 className='title'>Address Book</h1>
          </div>
          <div className='list'>
            {props.error && (
              <div className='list-error'>
                <img src='static/sad_cat.png' />
                <p>Ups! It seems that something went wrong. What have you done?</p>
              </div>
            )}
            {props.users && props.users.map(user => (
              <User key={user._id} {...user} />
            ))}
          </div>
        </div>
        <div className='info'>
          <img src='static/address_book.png' />
          <h1 className='title'>Keep in touch with your friends</h1>
          <p className='description'>
            This is your address directory where you can find your friend's
            contact information. Send them a greeting message!
          </p>
          <div className='divider'></div>
          <div className='footer'>
            <ComputerIcon />
            <span className='text'>Address Book is available for Mac.</span>
          </div>
        </div>
      </div>
    </div>

    <style jsx>{`
      :global(body) {
        box-sizing: border-box;
        margin: 0;
        font-family: system,-apple-system,system-ui,BlinkMacSystemFont,Helvetica Neue,Helvetica,Lucida Grande,sans-serif;
        width: 100%;
        height: 100vh;
        max-height: 100vh;
        background-image: linear-gradient(180deg, #03A9F4 100px, #dddbd1 100px, #d2dbdc);
      }

      .wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100vh;
      }

      .directory {
        width: calc(100% - 160px);
        height: calc(100vh - 60px);
        background-color: #f0f0f0;
        box-shadow: 0 1px 1px 0 rgba(0,0,0,.06), 0 2px 5px 0 rgba(0,0,0,.2);

        display: grid;
        grid-template-columns: 350px auto;
      }

      .directory .panel {
        border-right: 1px solid #cfcfcf;
        overflow-y: hidden;
      }

      .panel .header {
        height: 100px;
        border-bottom: 1px solid #cfcfcf;

        display: flex;
        justify-content: center;
        align-items: center;
      }

      .panel .header .title {
        font-weight: 300;
        letter-spacing: 1px;
        color: #4b5961;
      }

      .panel .list {
        height: calc(100% - 100px);
        overflow-y: scroll;
      }

      .list-error {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .list-error img {
        width: 100%;
        margin-top: 16px;
      }

      .list-error p {
        color: #929fa6;
        max-width: 80%;
        text-align: center;
      }

      .directory .info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .info img {
        border-radius: 50%;
        width: 50%;
        max-width: 350px;
      }

      .info .title {
        font-weight: 300;
        color: #4b5961;
        margin-top: 2.5rem;
      }

      .info .description,
      .info .footer {
        font-size: 0.8rem;
        color: #929fa6;
        max-width: 50%;
        text-align: center;
      }

      .info .divider {
        width: 50%;
        height: 1px;
        border-bottom: 1px solid #d9d9d9;
        margin: 2.0rem 0;
      }

      .info .footer {
        display: flex;
        align-items: center;
        font-size: 0.7rem;
      }
    `}</style>
  </div>
);

Home.getInitialProps = async () => {
  const [res, reqError] = await hp(fetch('http://10.0.2.224/users'));

  if (reqError) { return { error: reqError }; }

  const { users, error } = await res.json();

  if (error) { return { error }; }

  return { users };
}

export default Home
