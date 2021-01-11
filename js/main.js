$(document).ready(function() {
    let statistics = {
        in_queue: 0,
        time: 0
    }

    let start_data = {
        start_points: [],
        teams: 5,
        time_between: 5
    }

    let $control = $("#control-container");
    let teams = [];
    let stations = [];
    let paths = [];

    function gauss_in_range(min, max) {
        function randn_bm() {
            let u = 0, v = 0;
            while(u === 0) u = Math.random();
            while(v === 0) v = Math.random();
            let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
            num = num / 10.0 + 0.5;
            if (num > 1 || num < 0) return randn_bm();
            return num;
        }

        let range = max - min;
        return min + range * randn_bm();
    }

    function create() {
        let i;
        for (i = 0; i < start_data.teams; i++){
            teams[i] = {
                current_station: 0,
                current_station_progress: 0,
                current_path: 0,
                current_path_progress: 0,
                participants: 0,
                walk_speed: gauss_in_range(2, 5),
                work_speed: gauss_in_range(2, 5),
                me_in_queue: 0,
                status: "WAITING"
            };
        }

        stations[0] = {
            difficulty: 25,
            queue: 1,
            occupant: -1,
            paths: [0]
        }

        paths[0] = {
            length: 12,
            target: 1
        }

        stations[1] = {
            difficulty: 15,
            queue: 0,
            occupant: -1,
            paths: [1]
        }

        paths[1] = {
            length: 14,
            target: 2
        }

        stations[2] = {
            difficulty: 22,
            queue: 0,
            occupant: -1,
            paths: [2]
        }

        paths[2] = {
            length: 10,
            target: 3
        }

        stations[3] = {
            difficulty: 11,
            queue: 0,
            occupant: -1,
            paths: []
        }

        // paths[3] = {
        //     length: 10,
        //     target: 4
        // }
        //
        // stations[4] = {
        //     difficulty: 11,
        //     queue: 0,
        //     occupant: -1,
        //     paths: []
        // }
    }

    function simulate() {
        let i;
        let start_delay = 0;
        let finishers_counter = 0;

        step();
        function step() {
            finishers_counter = 0;

            for (i = 0; i < start_data.teams; i++) {
                if (teams[i].status === "WAITING" && start_delay === 0) {
                    teams[i].status = "WORKING";
                    stations[0].queue++;
                    start_delay = start_data.time_between;
                    console.log("Team " + i + " has STARTED");
                }

                if (teams[i].status === "WORKING") {
                    if (stations[teams[i].current_station].occupant === -1) {
                        stations[teams[i].current_station].occupant = i;
                        console.log("Team " + i + " STARTS at " + teams[i].current_station)
                    }

                    if (stations[teams[i].current_station].occupant === i) {
                        if (teams[i].current_station_progress <= 0) {
                            teams[i].current_station_progress = stations[teams[i].current_station].difficulty;
                        }

                        teams[i].current_station_progress -= teams[i].work_speed;
                        console.log("Team " + i + " is WORKING at station " + teams[i].current_station + " with result " + teams[i].current_station_progress + "/" + stations[teams[i].current_station].difficulty);

                        if (teams[i].current_station_progress <= 0) {
                            let paths_available = stations[teams[i].current_station].paths;
                            let smallest_queue = 1000;
                            let smallest_queue_id = 0;

                            stations[teams[i].current_station].queue--;
                            stations[teams[i].current_station].occupant = -1;
                            console.log("Station " + teams[i].current_station + " queue is " + stations[teams[i].current_station].queue)

                            if (paths_available.length > 0) {
                                paths_available.forEach(function (path) {
                                    if (stations[paths[path].target].queue < smallest_queue) {
                                        smallest_queue = stations[paths[path].target].queue;
                                        smallest_queue_id = path;
                                    }

                                    teams[i].status = "RUNNING";
                                    teams[i].current_path = smallest_queue_id;
                                    stations[paths[smallest_queue_id].target].queue++;
                                })

                                console.log("Team " + i + " is RUNNING on path " + smallest_queue_id);
                            } else {
                                teams[i].status = "FINISHED";
                                console.log("Team " + i + " has FINISHED the game ");
                            }
                        }
                    } else {
                        statistics.in_queue++;
                        teams[i].me_in_queue++;
                        console.log("Team " + i + " is " + stations[teams[i].current_station].queue + " at station " + teams[i].current_station);
                    }
                } else if (teams[i].status === "RUNNING") {
                    if (teams[i].current_path_progress <= 0) {
                        teams[i].current_path_progress = paths[teams[i].current_station].length;
                    }

                    teams[i].current_path_progress -= teams[i].walk_speed;
                    console.log("Team " + i + " is RUNNING at path " + teams[i].current_path + " with result " + teams[i].current_path_progress + "/"+ paths[teams[i].current_path].length);

                    if (teams[i].current_path_progress <= 0) {
                        teams[i].current_station = paths[teams[i].current_path].target;
                        teams[i].status = "WORKING";
                    }
                }

                if (teams[i].status === "FINISHED") {
                    finishers_counter++;
                }
            }

            statistics.time++;
            start_delay--;

            if (finishers_counter !== start_data.teams) {
                console.log ("Finished: " + finishers_counter)
                setTimeout(step, 50);
                return "WORKING";
            } else {
                console.log ("Game has been FINISHED")

                console.log("Average time in queue: " + statistics.in_queue)
                console.log("Average game time: " + statistics.time)

                var longest_team_queue = 0;
                var longest_team_index = 0;

                // for(var i = 0; i < 4; i++) {
                //     console.log(teams[i].me_in_queue);
                // }

                teams.forEach(function(team, index){
                    console.log(team.me_in_queue);
                        if (team.me_in_queue > longest_team_queue) {
                            longest_team_index = index;
                            longest_team_queue = team.me_in_queue;
                            console.log("Team " + index + " was in queue " + team.me_in_queue)
                        }
                })

                // teams.forEach(function(team, index){
                //     if (team.me_in_queue > longest_team_queue) {
                //         longest_team_index = index;
                //         longest_team_queue = team.me_in_queue;
                //         console.log("Team " + index + " was in queue " + team.me_in_queue)
                //     }
                // })
                console.log("Team longest in queues was: " + longest_team_index + " with average waiting time of " + longest_team_queue)
                return "FINISHED";
            }
        }
    }

    function run(amount_of_runs) {
        create();

        let i;
        // for (i = 0; i < amount_of_runs; i++) {
            simulate();
        // }

        // console.log("Average time in queue: " + statistics.in_queue / i)
        // console.log("Average game time: " + statistics.time / i)
        //
        // let longest_team_queue = 0;
        // let longest_team_index = 0;
        // teams.forEach(function(team, index){
        //     if (team.me_in_queue > longest_team_queue) {
        //         longest_team_index = index;
        //         longest_team_queue = team.me_in_queue;
        //     }
        // })
        //
        // console.log("Team longest in queues was: " + longest_team_index + " with average waiting time of " + longest_team_queue / i)
    }

    $control.find("#control-start").click(function (){
        let amount_of_runs = $("#control-amount_of_runs").val();
        run(amount_of_runs)
    })
})