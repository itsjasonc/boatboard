import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import styled from 'styled-components';
import 'reset-css';
import { DragDropContext } from 'react-beautiful-dnd';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import socketIOClient from 'socket.io-client';

import Swimlane from './swimlane';

const SwimlaneContainer = styled.div`
	display: flex;
`;

const requestURL = process.env.REACT_APP_BOATAPI_HOST + "/api";
const socketURL = process.env.REACT_APP_BOATWS_HOST;

/*
 * TODO: Use Redux to properly handle the array..
 */
class App extends React.Component {
	// Constructor
	constructor(props) {
		super(props);

		this.state = {
			swimlanes: [],
			boats: [],
			swimlaneOrder: [],
			DataisLoaded: false,
			isAddingBoat: false,
			newBoatName: "",
			socket: null,
		};
	}

	componentDidMount() {
		this.handleClick = this.handleClick.bind(this);
		this.setState({
			socket: socketIOClient(socketURL),
		}, () => {
			this.state.socket.on("message", data => {
				if (data.type === "moveBoat") {
					this.updateBoat(data.id, data.destination);
				} else if (data.type === "newBoat") {
					this.addBoat(data.boat);
				} else if (data.type === "deleteBoat") {
					this.deleteBoat(data.id);
				}
			});
		});

		const requestOptions = {
			method: "GET",
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			},
			mode: "cors",
		};

		Promise.all([
			fetch(requestURL + "/swimlane", requestOptions),
			fetch(requestURL + "/boat", requestOptions),
		]).then(
			results => Promise.all(results.map(r => r.json()))
		).then(([swimlanes, boats]) => {
			// Potentially there may be no swimlanes and boats
			// so we check if data is loaded rather then checking if the array length is 0
			var data = {
				swimlanes: swimlanes,
				boats: boats,
				swimlaneOrder: [],
				DataisLoaded: true
			};
			if (data.swimlanes.length > 0) {
				data.swimlanes.forEach(swimlane => {
					data.swimlaneOrder.push(swimlane._id);
				});
			}

			this.setState(data);
		}).catch((err) => {
			console.log(err);
		});
	}

	updateBoat = (id, destination) => {
		var index = this.state.boats.findIndex(x => x._id === id);

		if (index === -1) return;
		
		this.setState({
			boats: [
				...this.state.boats.slice(0, index),
				Object.assign({}, this.state.boats[index], { inLane: destination }),
				...this.state.boats.slice(index+1),
			]
		});

	}

	addBoat = (boat) => {
		this.setState({
			boats: [
				...this.state.boats,
				boat,
			]
		});
	}

	deleteBoat = (id) => {
		var index = this.state.boats.findIndex(x => x._id === id);
		
		if (index === -1) return;

		this.setState({
			boats: [
				...this.state.boats.slice(0, index),
				...this.state.boats.slice(index+1),
			]
		});
	}

	onDragEnd = result => {
		const {destination, source, draggableId } = result;

		// There was no drag destination
		if (!destination) {
			return;
		}

		// The user picked up a boat but never moved it anywhere upon release
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		// The swimlane we started dragging from
		const startSwimlane = this.state.swimlanes.filter(swimlane => swimlane._id === source.droppableId)[0];
		// The swimlane we stopped dragging from
		const finishSwimlane = this.state.swimlanes.filter(swimlane => swimlane._id === destination.droppableId)[0];
		
		if (startSwimlane._id === finishSwimlane._id) {
			// TODO: Reordering of boats in a swimlane
			

			return;
		} else {
			// const startBoatList = Array.from(startSwimlane
			const requestOptions = {
				method: "PATCH",
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ inLane: destination.droppableId })
			};

			fetch(
				requestURL + "/boat/" + draggableId, requestOptions
			).then(
				response => response.json()
			).then(result => {
				this.state.socket.emit("message", {
					"type": "moveBoat",
					"id": result._id,
					"destination": destination.droppableId,
				});
				this.updateBoat(result._id, destination.droppableId);
			}).catch((err) => {
				console.log(err);
			});
		}
	}

	handleClick() {
		if (this.state.newBoatName) {
			this.setState(prevState => ({
				isAddingBoat: true
			}));

			const requestOptions = {
				method: "POST",
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ name: this.state.newBoatName, inLane: this.state.swimlanes[0]._id })
			};

			fetch(
				requestURL + "/boat", requestOptions
			).then(
				response => response.json()
			).then(result => {
				this.state.socket.emit("message", {
					"type": "newBoat",
					"boat": result,
				});
				this.addBoat(result);
			}).catch((err) => {
				console.log(err);
				this.setState(prevState => ({
					isAddingBoat: false
				}));
			});

			console.log(this.state.newBoatName);
		}
	}

	updateInputValue(evt) {
		const val = evt.target.value;

		this.setState({
			newBoatName: val
		});
	}

	render() {
		// Wait for the data to be fetched..
		const { DataisLoaded } = this.state;
		if (!DataisLoaded) {
			return (
				<div>
					<h1>Fetching data...</h1>
				</div>
			);
		} else {
			// Data has been loaded
		}

		return (
			<Container>
				<Navbar bg="dark" fixed="bottom">
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
						<Form className="d-flex">
							<input
								placeholder="New boat name here"
								className="me-2"
								value={this.state.newBoatName}
								onChange={evt => this.updateInputValue(evt)}
							/>
							<Button
								variant="outline-success"
								disabled={this.state.isAddingBoat}
								onClick={!this.state.isAddingBoat ? this.handleClick : null }
							>Add new boat</Button>
						</Form>
					</Navbar.Collapse>
				</Navbar>
				<Container>
					<DragDropContext
						onDragEnd={this.onDragEnd}
					>
						<SwimlaneContainer>
						{
							this.state.swimlaneOrder.map(swimlaneOrderIndex => {
								const swimlane = this.state.swimlanes.filter(swimlane => swimlane._id === swimlaneOrderIndex)[0];
								const boats = this.state.boats.filter((boat) => boat.inLane === swimlane._id);

								return <Swimlane key={swimlane._id} swimlane={swimlane} boats={boats} />;
							})
						}
						</SwimlaneContainer>
					</DragDropContext>
				</Container>
			</Container>
		);
	}
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
