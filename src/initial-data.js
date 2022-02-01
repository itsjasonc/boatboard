const initialData = {
	swimlanes: [
		{ id: 'swimlane-1', name: 'Docked' },
		{ id: 'swimlane-2', name: 'Outbound to Sea' },
	],
	boats: [
		{ id: 'boat-1', name: 'Boat 1', inLane: 'swimlane-1' },
		{ id: 'boat-2', name: 'Boat 2', inLane: 'swimlane-1' },
		{ id: 'boat-3', name: 'Boat 3', inLane: 'swimlane-2' },
	],
	swimlaneOrder: ['swimlane-1'],
};

export default initialData;
