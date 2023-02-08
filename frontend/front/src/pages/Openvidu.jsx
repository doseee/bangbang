import axios from 'axios';
import { OpenVidu } from 'openvidu-browser';
import React, { Component } from 'react';
import UserVideoComponent from '../component/openvidu/UserVideoComponent';
import styled from 'styled-components';

const OPENVIDU_SERVER_URL = 'https://i8a405.p.ssafy.io:8086';
const OPENVIDU_SERVER_SECRET = 'A405';


let chattings = []

class Openvidu extends Component {
  
    constructor(props) {
        super(props);

        this.state = {
            mySessionId: 'SessionA',
            myUserName: 'Participant' + Math.floor(Math.random() * 100),
            session: undefined,
            mainStreamManager: undefined,
            publisher: undefined,
            subscribers: [],
            chat: "",
        };

        this.joinSession = this.joinSession.bind(this);
        this.leaveSession = this.leaveSession.bind(this);
        this.handleChangeSessionId = this.handleChangeSessionId.bind(this);
        this.handleChangeUserName = this.handleChangeUserName.bind(this);
        this.handleMainVideoStream = this.handleMainVideoStream.bind(this);
        this.onbeforeunload = this.onbeforeunload.bind(this);
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.onbeforeunload);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.onbeforeunload);
    }

    onbeforeunload(event) {
        this.leaveSession();
    }

    handleChangeSessionId(e) {
        this.setState({
            mySessionId: e.target.value,
        });
    }

    handleChangeUserName(e) {
        this.setState({
            myUserName: e.target.value,
        });
    }

    handleMainVideoStream(stream) {
        if (this.state.mainStreamManager !== stream) {
            this.setState({
                mainStreamManager: stream
            });
        }
    }

    deleteSubscriber(streamManager) {
        let subscribers = this.state.subscribers;
        let index = subscribers.indexOf(streamManager, 0);
        if (index > -1) {
            subscribers.splice(index, 1);
            this.setState({
                subscribers: subscribers,
            });
        }
    }

    
    
    // 채팅 기능
    chatAxios() {
      axios
          .post(OPENVIDU_SERVER_URL + '/openvidu/api/signal',
              {
                  "session": "SessionA",
                  "to": [],
                  "type":"MY_TYPE",
                  "data":`${this.state.myUserName}: ${this.state.chat}`
              },
              {
                  headers: {
                      Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                      'Content-Type': 'application/json'
                  },
                  withCredentials: false
              }
          )
          .then((response) => {
              console.log('Send Message Success', response);
              // chattings.push(`you: ${this.state.chat}`)
              console.log(chattings)
              this.setState({chat:""})
              console.log(this.state.chat)
          })
          .catch((response) => {
              console.log('Send Message Fail', response)
          })
    }

    onChange = (e) => {
      // setSearch(e.target.value)
      this.setState({chat:e.target.value})
    }

    activeEnter = (e) => {
      if (e.key === 'Enter') {
        this.chatAxios()
      }
    }

    // onClick = () => {
    //   if (search) {
    //     alert(`${search} 채팅`)
    //     setSearch('')
    //   }
    // }

    joinSession() {
        // --- 1) Get an OpenVidu object ---

        this.OV = new OpenVidu();

        // --- 2) Init a session ---

        this.setState(
            {
                session: this.OV.initSession(),
            },
            () => {
                var mySession = this.state.session;

                // --- 3) Specify the actions when events take place in the session ---

                // On every new Stream received...
                mySession.on('streamCreated', (event) => {
                    // Subscribe to the Stream to receive it. Second parameter is undefined
                    // so OpenVidu doesn't create an HTML video by its own
                    var subscriber = mySession.subscribe(event.stream, undefined);
                    var subscribers = this.state.subscribers;
                    subscribers.push(subscriber);

                    // Update the state with the new subscribers
                    this.setState({
                        subscribers: subscribers,
                    });
                });

                // On every Stream destroyed...
                mySession.on('streamDestroyed', (event) => {

                    // Remove the stream from 'subscribers' array
                    this.deleteSubscriber(event.stream.streamManager);
                });

                // On every asynchronous exception...
                mySession.on('exception', (exception) => {
                    console.warn(exception);
                });

                // --- 4) Connect to the session with a valid user token ---

                // 'getToken' method is simulating what your server-side should do.
                // 'token' parameter should be retrieved and returned by your own backend
                this.getToken().then((token) => {
                    // First param is the token got from OpenVidu Server. Second param can be retrieved by every user on event
                    // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
                    mySession
                        .connect(
                            token,
                            { clientData: this.state.myUserName },
                        )
                        .then(() => {

                            // --- 5) Get your own camera stream ---

                            // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
                            // element: we will manage it on our own) and with the desired properties
                            let publisher = this.OV.initPublisher(undefined, {
                                audioSource: undefined, // The source of audio. If undefined default microphone
                                videoSource: undefined, // The source of video. If undefined default webcam
                                publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
                                publishVideo: true, // Whether you want to start publishing with your video enabled or not
                                resolution: '640x480', // The resolution of your video
                                frameRate: 30, // The frame rate of your video
                                insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
                                mirror: false, // Whether to mirror your local video or not
                            });

                            // --- 6) Publish your stream ---

                            mySession.publish(publisher);
                            // Set the main video in the page to display our webcam and store our Publisher
                            if (this.state.subscribers.length === 0) {
                              this.setState({
                                mainStreamManager: publisher,
                                publisher: publisher,
                              });
                            } else {
                              for (let i=0; i<this.state.subscribers.length; i++) {
                                if (this.state.subscribers[i].stream.connection.remoteOptions.metadata === '{"clientData":"Participant1"}') {
                                  this.setState({
                                    mainStreamManager: this.state.subscribers[i]
                                  })
                                  console.log("이밑을봐라")
                                  console.log(this.state.subscribers[i])
                                }
                              }
                              this.setState({
                                publisher: publisher,
                              })
                            }                           
                        })
                        .catch((error) => {
                            console.log('There was an error connecting to the session:', error.code, error.message);
                        });
                });
                // 채팅
                mySession.on('signal', (event) => {
                  console.log('Received message', event.data);
                  chattings.unshift(event.data);
                  this.setState({chat:""})
                  
                });
            },
        );
    }

    leaveSession() {

        // --- 7) Leave the session by calling 'disconnect' method over the Session object ---

        const mySession = this.state.session;

        if (mySession) {
            mySession.disconnect();
        }

        // Empty all properties...
        this.OV = null;
        this.setState({
            session: undefined,
            subscribers: [],
            mySessionId: 'SessionA',
            myUserName: 'Participant' + Math.floor(Math.random() * 100),
            mainStreamManager: undefined,
            publisher: undefined
        });
    }

    render() {
      const mySessionId = this.state.mySessionId;
      const myUserName = this.state.myUserName;
    
      let chatbox = chattings.map((chatting, index) => <SChatP index={index}>{chatting}</SChatP>)

      return (
        <Wrapper>
          <Container className="container">
            {this.state.session === undefined ? (
              <div id="join">
                <div id="img-div">
                    <img src="resources/images/openvidu_grey_bg_transp_cropped.png" alt="OpenVidu logo" />
                </div>
                <div id="join-dialog" className="jumbotron vertical-center">
                  <h1> Join a video session </h1>
                  <form className="form-group" onSubmit={this.joinSession}>
                    <p>
                      <label>Participant: </label>
                      <input
                        className="form-control"
                        type="text"
                        id="userName"
                        value={myUserName}
                        onChange={this.handleChangeUserName}
                        required
                      />
                    </p>
                    <p>
                      <label> Session: </label>
                      <input
                        className="form-control"
                        type="text"
                        id="sessionId"
                        value={mySessionId}
                        onChange={this.handleChangeSessionId}
                        required
                      />
                    </p>
                    <p className="text-center">
                      <input className="btn btn-lg btn-success" name="commit" type="submit" value="JOIN" />
                    </p>
                  </form>
                </div>
              </div>
            ) : null}

            {this.state.session !== undefined ? (
              <div id="session">
                <STitleDiv id="session-header">
                  <h1 id="session-title">{mySessionId}</h1>
                  <input
                    className="btn btn-large btn-danger"
                    type="button"
                    id="buttonLeaveSession"
                    onClick={this.leaveSession}
                    value="나가기"
                  />
                </STitleDiv>
                {this.state.mainStreamManager !== undefined ? (
                  <SScreenDiv id="main-video" className="col-md-6">
                    <UserVideoComponent streamManager={this.state.mainStreamManager} />
                  </SScreenDiv>
                ) : null}
                <SChatDiv>
                  <SChatAreaDiv>
                    
                    {chatbox}
                    
                  </SChatAreaDiv>
                </SChatDiv>
                {/* <SInput type="text" onKeyDown={(e) => this.activeEnter(e)}/> */}
                <SInput type="text" value={this.state.chat} onChange={this.onChange} onKeyDown={(e) => this.activeEnter(e)} placeholder=" 내용을 입력하세요" />
                {/* <SButton disabled={(search) ? false : true}><SImg src={searchbutton} alt="#" onClick={onClick} /></SButton> */}
                
                <div id="video-container" className="col-md-6">
                  {this.state.publisher !== undefined ? (
                    <div className="stream-container col-md-6 col-xs-6" onClick={() => this.handleMainVideoStream(this.state.publisher)}>
                      <UserVideoComponent streamManager={this.state.publisher} />
                    </div>
                  ) : null}
                  {this.state.subscribers.map((sub, i) => (
                    <div key={i} className="stream-container col-md-6 col-xs-6" onClick={() => this.handleMainVideoStream(sub)}>
                      <UserVideoComponent streamManager={sub} />
                    </div>
                  ))}    
                </div>
              </div>
            ) : null}
          </Container>
        </Wrapper>
      );
    }

    /**
     * --------------------------
     * SERVER-SIDE RESPONSIBILITY
     * --------------------------
     * These methods retrieve the mandatory user token from OpenVidu Server.
     * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION (by using
     * the API REST, openvidu-java-client or openvidu-node-client):
     *   1) Initialize a Session in OpenVidu Server	(POST /openvidu/api/sessions)
     *   2) Create a Connection in OpenVidu Server (POST /openvidu/api/sessions/<SESSION_ID>/connection)
     *   3) The Connection.token must be consumed in Session.connect() method
     */

    getToken() {
        return this.createSession(this.state.mySessionId).then((sessionId) => this.createToken(sessionId));
    }

    createSession(sessionId) {
        return new Promise((resolve, reject) => {
            var data = JSON.stringify({ customSessionId: sessionId });
            axios
                .post(OPENVIDU_SERVER_URL + '/openvidu/api/sessions', data, {
                    headers: {
                        Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                        'Content-Type': 'application/json',
                    },
                    withCredentials: false
                })
                .then((response) => {
                    console.log('CREATE SESION', response);
                    resolve(response.data.id);
                })
                .catch((response) => {
                    var error = Object.assign({}, response);
                    if (error?.response?.status === 409) {
                        resolve(sessionId);
                    } else {
                        console.log(error);
                        console.warn(
                            'No connection to OpenVidu Server. This may be a certificate error at ' +
                            OPENVIDU_SERVER_URL,
                        );
                        if (
                            window.confirm(
                                'No connection to OpenVidu Server. This may be a certificate error at "' +
                                OPENVIDU_SERVER_URL +
                                '"\n\nClick OK to navigate and accept it. ' +
                                'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
                                OPENVIDU_SERVER_URL +
                                '"',
                            )
                        ) {
                            window.location.assign(OPENVIDU_SERVER_URL + '/accept-certificate');
                        }
                    }
                });
        });
    }

    createToken(sessionId) {
        return new Promise((resolve, reject) => {
            var data = {};
            axios
                .post(OPENVIDU_SERVER_URL + "/openvidu/api/sessions/" + sessionId + "/connection", data, {
                    headers: {
                        Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                        'Content-Type': 'application/json',
                    },
                    withCredentials: false
                })
                .then((response) => {
                    console.log('TOKEN', response);
                    resolve(response.data.token);
                })
                .catch((error) => reject(error));
        });
    }
}

export default Openvidu;

const Wrapper = styled.div`
  display: flex;
  background-color: black;
`;

const Container = styled.div`
  width: 45vh;
  height: 90vh;
  background-color: white;
`;

const STitleDiv = styled.div`
  display: grid;
  grid-template-columns: 10fr 2fr;
`;

const SScreenDiv = styled.div`
  width: 100%;
  height: 65vh;
`;

const SChatDiv = styled.div`
  display: grid;
  grid-direction: row;
  grid-template-row: 5fr 1fr;
  width: 100%;
  height: 15vh;
  border: 1px solid black;
`;

const SChatAreaDiv = styled.div`
  border: 1px solid black;
  display: flex;
  overflow-y: auto;
  flex-direction: column-reverse;
  word-wrap: break-word;
`;

const SInput = styled.input`
  width: 100%;
`;

const SChatP = styled.p`
  margin-bottom: 0px;
`;

const SButton = styled.button`
  border-radius: 10px;
  margin-left: 10px;
  height: 35px;
  border: 0 solid black;
  background-color: #00ff0000; 
`;

const SImg = styled.img`
  width: 30px;
  height: 30px;
`;
