new Vue({
    el: '#app',

    data: {
        gameType: 'rapid',
        usernames: ``,

        playerRatings: [],

        pairing_config: [
            [5, 1], // #5 plays #1, etc...
            [8, 4],
            [6, 2],
            [7, 3],
        ],
    },

    computed: {
        players: function(){
            return this.usernames.split("\n").filter(Boolean)
        },
        playerRatingsSorted: function(){
            return [...this.playerRatings].sort((a, b) => (a.rating < b.rating) ? 1 : -1)
        },
    },

    methods: {
        submit: function() {
            this.playerRatings = []

            this.fetchPlayerRatings()
        },

        fetchPlayerRatings: function() {
            axios.post('https://lichess.org/api/users', this.players.join(','))
                .then(function(response){
                    response.data.forEach(function(player){
                        this.playerRatings.push({
                            name: player.username,
                            rating: player.perfs[this.gameType].rating,
                            games: player.perfs[this.gameType].games,
                        })
                    }.bind(this))
                }.bind(this))
        },
    },
})
