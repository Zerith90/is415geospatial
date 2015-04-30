<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
    </head>
    <body>
        <table>

        </table>

    </body>
</html>


<script type="text/javascript" src="js/Geocoder.js"></script>
<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/csv-obj.js"></script>



<script>
    $(document).ready(function() {
        $.ajax({
            type: "GET",
            url: "schools.csv",
            success: function(data) {
                
                processData(data);
            }
        });
    });

    function processData(data) {
        
        var allTextLines = data.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var lines = [];

        for (var i = 1; i < allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {

                var tarr = [];
  set
                    geocodex(data[1] + " " + data[2],data[2])
             
                 
                for (var j = 0; j < headers.length; j++) {
                   
                    tarr.push(data[j]);
                }
                lines.push(tarr);
            }
        }
        var refined = []


    }
    function geocodex(data,postal) {
           console.log(data)
           
         var openStreetMapGeocoder = GeocoderJS.createGeocoder('openstreetmap');
         openStreetMapGeocoder.geocode(data, function(result) {
    
         $('body table').append("<tr><td>"+ postal+ "</td><td>" + result[0].longitude + "</td><td>"+ result[0].latitude + '</td></tr>')    
         
         return result
         });
    
    
    }


</script>
