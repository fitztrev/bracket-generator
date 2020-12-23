new Vue({
    el: '#app',

    data: {
        usernames: ``,
        gameType: 'rapid',
        challengeInstructions: '7+2 Casual',
        format: 'bracket',

        playerRatings: [],

        pairing_config: {
            8: [ // when 8 players...
                [5, 1], // #5 seed plays #1 seed, etc...
                [8, 4],
                [6, 2],
                [7, 3],
            ],
            7: [
                [null, 1],
                [7, 4],
                [5, 2],
                [6, 3],
            ],
            6: [
                [null, 1],
                [6, 4],
                [null, 2],
                [5, 3],
            ],
        },
    },

    computed: {
        players: function(){
            return this.usernames.split("\n").filter(Boolean)
        },
        playerRatingsSorted: function(){
            let direction = this.format === 'ladder' ? 'asc' : 'desc'
            return _.orderBy(this.playerRatings, ['rating', 'games'], direction)
        },
        pairings: function(){
            if (this.playerRatings.length < 6 || this.playerRatings.length > 8) {
                return
            }

            let pairings = []

            let pairing_config = this.pairing_config[this.playerRatings.length]

            console.log(pairing_config)

            for(var i=0; i<pairing_config.length; i++) {
                pairings.push(
                    [
                        this.formatNameForBracket(pairing_config[i][0]),
                        this.formatNameForBracket(pairing_config[i][1]),
                    ]
                )
            }

            return pairings
        },
        linkToBracket: function() {
            return 'bracket.html?challengeInstructions=' + encodeURIComponent(this.challengeInstructions) + '&pairings=' + encodeURIComponent(JSON.stringify(this.pairings))
        },
        ladderIsDefeated: function() {
            return this.playerRatings.length && this.playerRatings.length === _.filter(this.playerRatings, p => p.ladderResult === 'win').length
        },
    },

    watch: {
        ladderIsDefeated: function(value){
            if (value) this.fireConfetti()
        },
    },

    methods: {
        formatNameForBracket(seed) {
            if (! seed) return

            return '#' + seed + ' - ' + this.playerRatingsSorted[seed - 1].name
        },
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
                            ladderResult: '',
                        })
                    }.bind(this))
                }.bind(this))
        },

        fireSingleConfetti:  function(){
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        },

        fireConfetti: function() {
            // https://www.kirilv.com/canvas-confetti/
            var duration = 20 * 1000;
            var animationEnd = Date.now() + duration;
            var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 200 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        },
    },
})
