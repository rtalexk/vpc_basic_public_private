import React from 'react';

const User = (props) => (
  <div className='user'>
    <div className='picture'>
      <img src={props.avatar} />
    </div>
    <div className='info'>
      <div className='personal'>
        <div className='first-row'>
          <p className='name'>{props.name.first} {props.name.last}</p>
          <span className='date'>22/03/19</span>
        </div>
        <p className='address'>{props.address}</p>
        <p className='phone'>{props.phone}</p>
      </div>
      <div className='date'></div>
    </div>

    <style jsx>{`
      .user {
        position: relative;
        box-sizing: border-box;
        padding: 8px 16px;
        height: 70px;

        display: grid;
        grid-template-columns: 54px auto;
        cursor: default;
      }

      .user:hover {
        background-color: #e4e4e4;
      }

      .user:before {
        content: '';
        position: absolute;
        bottom: 0px;
        right: 8px;

        width: calc(100% - 88px);
        height: 1px;
        background-color: #e4e4e4;
      }

      .user .picture img {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        display: block;
      }

      .user .info {
        margin-left: 10px;

        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .user .info p {
        margin: 0;
      }

      .user .info .personal .first-row {
        position: relative;
      }

      .user .info .personal .name {
        font-size: 0.9rem;
        color: #4b5961;
      }

      .user .info .personal .address,
      .user .info .personal .phone,
      .user .info .personal .date {
        font-size: 0.8rem;
        color: rgba(0,0,0,.6);
      }

      .user .info .personal .address,
      .user .info .personal .phone {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 254px;
      }

      .user .info .personal .date {
        position: absolute;
        right: 0;
        top: 0;
        font-size: 0.7rem;
      }
    `}</style>
  </div>
);

export default User;
