var Table = function module() {
    var dispatch = d3.dispatch("edit");

     function getSum(total, num) {
        return total + num;
    }

    function exports(_selection) {
        _selection.each(function (_dataset) {

            //________________________________________________
            // Data
            //________________________________________________
            var data = _dataset[0];
            var columnNames = _dataset[1];
            columnNames.unshift("From/To")
            //  for (var i = 0; i < data.length; i++) {
            //     data[i].unshift(i)
            //    } 
            //________________________________________________
            // Table
            //________________________________________________
            var table = d3.select(this).selectAll("table").data([0]);
            table.enter().append('table')
                .append('tr')
                .attr('class', 'header-row')
                .selectAll('th')
                .data(columnNames)
                .enter().append('th')
                .attr('class', 'header .no-select')
                .text(function(d, i){return d;});
     
            var rows = table.selectAll('tr.row')
                .data(data);
            rows.enter().append('tr')
                .attr('class', 'row').append('th').attr('class', 'header .no-select').text(function(d, i){return i;});
            var cells = rows.selectAll('td.cell')
                .data(function(d, i){return d;})
            cells.enter().append('td')
                .attr({class: 'cell', contenteditable: true});

            rows.append('td').attr('class', 'totals').text(function(d){return Math.round(d.reduce(getSum,0)) })

            cells.text(function(d, i){return d;})
                .on("keyup", function(d, i){
                    var newData = [];
                    d3.select('.table').selectAll('tr.row').selectAll('td')
                        .each(function(d, i, pI){
                            var text = d3.select(this).text();
                            if (typeof newData[pI] == 'undefined') newData[pI] = [];
                            newData[pI].push(text)
                        });

                    dispatch.edit(newData);

                        // console.log(newData[j].slice(0,-1).map(Math.floor).reduce(getSUm,0))
                        d3.selectAll('td.totals').text( function(d,i){
                           return Math.round(newData[i].slice(0,-1).map(parseFloat).reduce(getSum,0))
                        })

                    
                    
                });
        });
    }

    d3.rebind(exports, dispatch, "on");

    return exports;
};