const request = require('request-promise');
const chalk = require('chalk');
const moment = require('moment');

class Privacy {
    constructor(apiKey, developmentMode = false, log = false) {
        this.apiKey = apiKey;
        this.subDomain = !developmentMode ? 'api' : 'sandbox';
        this.log = log
        this.headers = {
            'Authorization' : `api-key ${this.apiKey}`
        }
    }
    
    async getLink(path) {
        return `https://${this.subDomain}.privacy.com${path}`
    }

    async getAllCards() {
        try {
            let cards = [];
            let res = await request.get(await this.getLink('/v1/card'), {
                headers: this.headers,
                json: true
            });
            cards = cards.concat(res.data);
            if (res.total_pages > 1) {
                for(let i = res.page; i < res.total_pages; i) {
                    ++i;
                    let res = await request.get(await this.getLink(`/v1/card?page=${i}`), {
                        headers: this.headers,
                        json: true
                    });
                    cards = cards.concat(res.data);
                }
            }
            return cards;
        } catch (e) {
            throw e;
        }
    }

    async getCard(token) {
        try {
            let res = await request.get(await this.getLink(`/v1/card?card_token=${token}`), {
                headers: this.headers,
                json: true
            });
            if(!res.data.length > 0) {
                throw new Error('No card found with specified token')
            }
            return res.data[0];
        } catch (e) {
            throw e;
        }
    }

    async newCard(type = 'single', name = null, spend_limit = null , spend_limit_duration = null) {
        try {
            let types = {
                'single' : 'SINGLE_USE',
                'locked' : 'MERCHANT_LOCKED',
                'unlocked' : 'UNLOCKED'
            }
            let spendingTypes = {
                'transaction' : 'TRANSACTION',
                'monthly' : 'MONTHLY',
                'annually' : 'ANNUALLY',
                'forever' : 'FOREVER'
            }
            let postData = {
                'type' : types[type]
            }
            if(name !== null) {postData.memo = name};
            if(spend_limit !== null) {postData.spend_limit = parseInt(spend_limit) * 100};
            if(spend_limit_duration !== null) {
                if (!(Object.keys(spendingTypes).includes(spend_limit_duration))) {
                    throw new Error('Invalid spend_limit_duration');
                }
            };
            //console.log(postData)
            let res = await request.post(await this.getLink('/v1/card'), {
                headers: {...this.headers, 'Content-Type' : 'application/json'},
                json: postData,
                resolveWithFullResponse: true
            })
            return res.body;
        } catch (e) {
            throw e;
        }
    }

    async fetchTransactions(type = 'all') {
        let transactions = [];
        try {
            let res = await request.get(await this.getLink(`/v1/transaction/${type}`), {
                headers: this.headers,
                json: true
            })
            transactions = transactions.concat(res.data);
            if (res.total_pages > 1) {
                for(let i = res.page; i < res.total_pages; i) {
                    ++i;
                    let res = await request.get(await this.getLink(`/v1/transaction/all?page=${i}`), {
                        headers: this.headers,
                        json: true
                    });
                    transactions = transactions.concat(res.data);
                }
            }
            return transactions;
        } catch (e) {
            throw e
        }
    }
    async fetchDate() {
        let date = ``
    }
    async fetchTransactionsByDate(type, start_date = null, end_date = moment().format('YYYY-MM-DD')) {
        let params = `end=${end_date}`;
        if (start_date !== null) {params += `&begin=${start_date}`}
        let transactions = [];
        try {
            let res = await request.get(await this.getLink(`/v1/transaction/${type}?${params}`), {
                headers: this.headers,
                json: true
            })
            transactions = transactions.concat(res.data);
            if (res.total_pages > 1) {
                for(let i = res.page; i < res.total_pages; i) {
                    ++i;
                    let res = await request.get(await this.getLink(`/v1/transaction/${type}?${params}&page=${i}`), {
                        headers: this.headers,
                        json: true
                    });
                    transactions = transactions.concat(res.data);
                }
            }
            return transactions;
        } catch (e) {
            throw e
        }
    }
    async fetchTotalSpending(start_date = null, end_date = moment().format('YYYY-MM-DD')) {
        try {
            let transactions = await this.fetchTransactionsByDate('approvals', start_date, end_date)
            return transactions.map(transaction => {return transaction.amount}).reduce((total, transaction) => total + transaction) / 100;
        } catch (e) {
            throw e;
        }
    }
}


module.exports = Privacy;