$(document).ready(function () {
    var total_stocks = 0;
    $.ajax({
        type: 'GET',
        url: server_url + '/get',
        success: function (data) {
            data.forEach(function (d) {
                my_stocks[d.Symbol] = d.No_of_stocks;
                prev_prices[d.Symbol] = 0;
            });
            // Refreshing stocks every 5 seconds
            setInterval(function () {
                ajaxReq('BATCH_STOCK_QUOTES');
            }, 5000);
        }
    });
    
    /* Events */

    $("#searchBtn").on('click', function (e) {
        var symbol = ($('#searchTextbox').val()).toUpperCase();
        if (symbol === "") {
            $('#search-error-msg').show();
            $('.search_loader').hide();
        } else {
            if ($.inArray(symbol, Object.keys(my_stocks)) > -1) {
                alert("This stock already exists in your portfolio");
            } else {

                getDetails(symbol, '#searchModal .modal-body #modal-body-content');
                $('#search-error-msg').hide();
                $('.modal-body-input').hide();
                $('.search_loader').show();
            }
        }
    });

    /* Add click Event */
    $('#modal-add-btn').on('click', function (e) {
        var symbol = ($('#searchTextbox').val()).toUpperCase();
        var stocks = 0;
        if ($('#stocks-input').val() !== "") stocks = $('#stocks-input').val();
        if (stocks < 0) alert("Please enter positive value for the stock");
        else {
            if (Object.keys(my_stocks).length === 5) {
                $('#searchModal').modal('hide');
                alert("Cannot add more than 5 stocks to your portfolio!");
            } else {
                $.ajax({
                    type: 'GET',
                    url: server_url + '/add?symbol=' + symbol + '&stocks=' + stocks,
                    success: function (data) {
                        $('#searchModal').modal('hide');
                        $('.modal-body #modal-body-content').html("");
                        my_stocks[symbol] = stocks;
                        ajaxReq('BATCH_STOCK_QUOTES');
                        alert(symbol + " is being added to your portfolio!");
                    }
                });
            }
        }
    });
});

