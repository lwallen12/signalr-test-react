import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Axios from 'axios';
import { HubConnectionBuilder } from '@microsoft/signalr';

class App extends Component {

  state = {
    chats: [],
    myInput: '',
    inputFromClient: ''
  }

  constructor(props) {
    super(props);

    this.handleInputChange =  this.handleInputChange.bind(this);
    this.handleClientChange = this.handleClientChange.bind(this);

    const connection = new HubConnectionBuilder()
            .withUrl('https://localhost:44398/hubs/chat')
            .withAutomaticReconnect()
            .build();

            connection.start()
            .then(result => {
                console.log('Connected!');

                connection.invoke("JoinRoom", {groupName: "howdy", connId: connection.connectionId})
        .catch(e => console.log(e));

          setInterval(
          //   // console.log("");
          //   connection.invoke("SendMessage", {groupName: "howdy", message: "Howdyyy boys"})
          // .catch(e => console.log(e))

          //^^^Something was just off with the catch function in here
          
          function() {
            connection.invoke("SendMessage", {groupName: "howdy", message: "Howdyyy boys"})
          }, 30000
          )

                //this is an event listener for when the server broadcast
                connection.on('BroadCast', message => {
                    console.log(message);
                    //const updatedChat = [...this.state.chats];
                    //updatedChat.push({user: message.user, message: message.message});
                
                    //setChat(updatedChat);
                    //this.setState({chats: updatedChat})
                });

                connection.on('SendGroup', message => {
                  console.log(message);
              });
            })
            .catch(e => console.log('Connection failed: ', e));

  }

  //this really just calls the api broadcast method
  onBroadcast() {
    Axios.get('https://localhost:44398/api/values')
      .then( response => {
        console.log(response)
      })
      .catch( error => {
        console.log(error);
      })
  }



  handleInputChange(event) {
    this.setState({myInput: event.target.value})
    //console.log(event.target.value);
  }

  handleClientChange(event) {
    this.setState({inputFromClient: event.target.value})
  }

  onBroadcastValue() {
    //console.log(this.state.myInput);
    Axios.post('https://localhost:44398/api/values', {value: this.state.myInput})
      .then( response => {
        console.log("was successfull should see the message: " + this.state.myInput);
      })
      .catch( error => {
        console.log(error);
      })
  }

  onGroupAdd() {

    const connection = new HubConnectionBuilder()
    .withUrl('https://localhost:44398/hubs/chat')
    .withAutomaticReconnect()
    .build();

    connection.start().then(function () {

      // event.preventDefault();
      //invoke the name of the method in the hub
      connection.invoke("JoinRoom", {groupName: "howdy", connId: connection.connectionId})
        .catch(e => console.log(e));
    })

    // connection.connectionId
  }

  onGroupSend() {
    const connection = new HubConnectionBuilder()
    .withUrl('https://localhost:44398/hubs/chat')
    .withAutomaticReconnect()
    .build();

    connection.start().then(function () {
      //invoke the name of the method in the hub
      connection.invoke("SendMessage", {groupName: "howdy", message: "Howdy boys"})
        .catch(e => console.log(e));
    })
  }

  onSendFromClient(payload) {
    const connection = new HubConnectionBuilder()
    .withUrl('https://localhost:44398/hubs/chat')
    .withAutomaticReconnect()
    .build();

    connection.start().then(function () {
      //invoke the name of the method in the hub
      connection.invoke("BroadcastFromClient", {message: payload, else: "some other data for proof"})
        .catch(e => console.log(e));
    })

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="broadcast">
          <h3>All methods</h3>
          <div>
            <button onClick={this.onBroadcast}>Trigger Server BroadCast</button>
          </div>
          <div className="second-broadcast">
            <input value={this.state.myInput} onChange={this.handleInputChange} />
            <button onClick={() => this.onBroadcastValue()}>Broadcast input server (technically?)</button>
          </div>
        </div>
        <hr />
        <div className="group-broadcast">
          <h3>Group Methods</h3>
          <button onClick={() => this.onGroupAdd()}>Add This guy to group</button>
          <button onClick={() => this.onGroupSend()}>Send a message</button>
        </div>
        <hr />
        <h3>These are invoked from Client</h3>
        <input value={this.state.inputFromClient} onChange={this.handleClientChange} />
        <button onClick={() => this.onSendFromClient(this.state.inputFromClient)}>Send this message from client</button>
      </div>
    );
  }
}

export default App;
