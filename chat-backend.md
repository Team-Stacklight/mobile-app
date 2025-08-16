Accessing the application

Open API Client Execute POST /rooms with body { "room_name": "Room 1", "topic": "Ethics", "created_by": "Admin" }

Execute POST /rooms/join with body { "room_id": "<id from the first endpoint's response>", "username": "john" }

Execute POST /rooms/join with body { "room_id": "<id from the first endpoint's response>", "username": "david" }

Open web socket client 1 with following WS URL: ws://api.dhruvshah.se/ws/:roomId/john

Open web socket client 2 with following WS URL: ws://api.dhruvshah.se/ws/:roomId/david


Chat room id: 1577494c-249a-48e2-9b60-4b2a158f40d0