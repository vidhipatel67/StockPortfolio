var my_stocks = {};	// variable to keep track of Horace's stocks
var prev_prices = {};
// Function to send request to alphavantage API
function ajaxReq(funct) {
    //console.log(my_stocks);
    if (Object.keys(my_stocks).length < 1) {
        $('#portfolio-error').show();
        $('#data-table').hide();
        $('#st-current-value').text(0.0);
        $('#st-current-stocks').text(0);
    } else {
        $('#portfolio-error').hide();
        $('#data-table').show();
        var url = base_url + 'function=' + funct + '&symbols=' + (Object.keys(my_stocks)).toString() + '&apikey=' + API_KEY;
        // Ajax request using d3
        d3.json(url, function (error, data) {
            console.log(data);
            var stock_data = data["Stock Quotes"];
            var totalStocks = 0;
            var totalPrice = 0;
            stock_data.forEach(function (d) {
                d.symbol = d['1. symbol'];
                d.price = d['2. price'];
                totalStocks += parseInt(my_stocks[d.symbol]);
                d.share = my_stocks[d.symbol];
                d.market_value = (d.price * d.share).toFixed(4);
                totalPrice += parseFloat(d.market_value);
                d.timestamp = d['4. timestamp'];
                // Calculate flag if the price has gone up or down
                d.flag = (d.price >= prev_prices[d.symbol]);
                prev_prices[d.symbol] = d.price;
            });
            // Generate table
            var ndx = crossfilter(stock_data);
            var symbolDim = ndx.dimension(function (d) {
                return d.symbol
            });

            var table = dc.dataTable('#data-table');

            table
                .dimension(symbolDim)
                .group(function (d) {
                    return d.value;
                })
                //.sortBy(function(d) { return +d.symbol; })
                .showGroups(false)
                .columns([
                    {
                        label: 'Symbol',
                        format: function (d) {
                            return d.symbol;
                        }
                    },
                    {
                        label: 'Up/Down',
                        format: function (d) {
                            var loc = window.location.pathname;
                            var dir = loc.substring(0, loc.lastIndexOf('/'));
                            if (!d.flag) return "<img src='" + dir + "/images/red-down.png'/>";
                            else return "<img src='" + dir + "/images/green-up.png'/>";

                        }
                    },
                    {
                        label: 'Trade Price ($)',
                        format: function (d) {
                            return d.price;
                        }
                    },
                    {
                        label: 'Your Shares',
                        format: function (d) {
                            return d.share;
                        }
                    },
                    {
                        label: 'Market Value of Stake ($)',
                        format: function (d) {
                            return d.market_value;
                        }
                    },
                    {
                        label: 'Last Updated(US/Eastern)',
                        format: function (d) {
                            return d.timestamp;
                        }
                    },
                    {
                        label: 'Remove',
                        format: function (d) {
                            return ' <button type="button" class="btn btn-danger remove-btn" data="' + d.symbol + '">Remove</button>';
                        }
                    },
                    {
                        label: 'Details',
                        format: function (d) {
                            return ' <button type="button" class="btn btn-default details-btn" data="' + d.symbol + '">Details</button>';
                        }
                    }
                ]);

            dc.renderAll();
            $("#portfolio-div .loader").hide();
            // Update Total price value for Horace
            $('#st-current-value').text(totalPrice.toFixed(3));
            $('#st-current-stocks').text(totalStocks);

            // Click event for remove button for each entry in portfolio
            $('.remove-btn').on('click', function (e) {
                var symbol = $(this).attr('data');
                $.ajax({
                    type: 'GET',
                    url: server_url + '/remove?symbol=' + symbol,
                    success: function (data) {
                        delete my_stocks[symbol];
                        ajaxReq('BATCH_STOCK_QUOTES');
                        alert("Removed " + symbol);
                    }
                });
            });

            // Click event for details button for each entry in portfolio
            $('.details-btn').on('click', function (e) {
                $('#details_div .loader').show();
                var symbol = $(this).attr('data');
                getDetails(symbol, '#details_div .details_text');

            });

        });
    }
}

function getDetails(symbol, div) {
    var url = base_url + 'function=TIME_SERIES_DAILY&symbol=' + symbol + '&outputsize=full&apikey=' + API_KEY;
    d3.json(url, function (error, data) {
        if (data['Error Message']) {
            $('#search-error-msg').show();
            $('.search_loader').hide();
        } else {
            if (div === '#searchModal .modal-body #modal-body-content') $('#searchModal').modal('show');
            var meta_data = data['Time Series (Daily)'];
            var first = (Object.keys(meta_data)[0]);
            $('.modal-body-input').show();
            $(div).html('<b><h4>Stock Symbol: ' + symbol + '</h4></b><br/>' +
                '<h5><b>Date: </b>' + first + '</h5>' +
                '<h5><b>Open: </b>' + meta_data[first]['1. open'] + '</h5>' +
                '<h5><b>High: </b>' + meta_data[first]['2. high'] + '</h5>' +
                '<h5><b>Low: </b>' + meta_data[first]['3. low'] + '</h5>' +
                '<h5><b>Close: </b>' + meta_data[first]['4. close'] + '</h5><br/>');

            $('#details_div .loader').hide();
            $('.search_loader').hide();
        }

    });
}