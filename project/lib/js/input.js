/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {
    readCSV();
    initWiz();
})
function readCSV() {
    $("#file").change(function(e) {
        var ext = $("input#file").val().split(".").pop().toLowerCase();

        if ($.inArray(ext, ["csv"]) == -1) {
            swal({title:'Broken csv',text:'Please upload CSV only',type:"warning"});
            $("input#file").val('')
            return false;
        }

        if (e.target.files != undefined) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var csvval = e.target.result.split("\n");
                swal("total number of rows:" + csvval.length)
                var csvvalue = csvval[0].split(",");
                var inputrad = "";
                for (var i = 0; i < csvvalue.length; i++)
                {
                    var temp = csvvalue[i];
                    var inputrad = inputrad + " " + temp;
                }
                $("#data").html(inputrad);
                $("#csvimporthinttitle").show();
            };
            reader.readAsText(e.target.files.item(0));

        }

        return false;

    });
}

function initWiz(){
           var form = $('#submit_form');
            var error = $('.alert-danger', form);
            var success = $('.alert-success', form);
            var handleTitle = function(tab, navigation, index) {
                var total = navigation.find('li').length;
                var current = index + 1;
                // set wizard title
                $('.step-title', $('#form_wizard_1')).text('Step ' + (index + 1) + ' of ' + total);
                // set done steps
                jQuery('li', $('#form_wizard_1')).removeClass("done");
                var li_list = navigation.find('li');
                for (var i = 0; i < index; i++) {
                    jQuery(li_list[i]).addClass("done");
                }

                if (current == 1) {
                    $('#form_wizard_1').find('.button-previous').hide();
                } else {
                    $('#form_wizard_1').find('.button-previous').show();
                }

                if (current >= total) {
                    $('#form_wizard_1').find('.button-next').hide();
                    $('#form_wizard_1').find('.button-submit').show();
                    displayConfirm();
                } else {
                    $('#form_wizard_1').find('.button-next').show();
                    $('#form_wizard_1').find('.button-submit').hide();
                }
                
            }

    $('#form_wizard_1').bootstrapWizard({
                'nextSelector': '.button-next',
                'previousSelector': '.button-previous',
                onTabClick: function (tab, navigation, index, clickedIndex) {
                    return false;
                    /*
                    success.hide();
                    error.hide();
                    if (form.valid() == false) {
                        return false;
                    }
                    handleTitle(tab, navigation, clickedIndex);
                    */
                },
                onNext: function (tab, navigation, index) {
                    success.hide();
                    error.hide();

                    handleTitle(tab, navigation, index);
                },
                onPrevious: function (tab, navigation, index) {
                    success.hide();
                    error.hide();

                    handleTitle(tab, navigation, index);
                },
                onTabShow: function (tab, navigation, index) {
                    var total = navigation.find('li').length;
                    var current = index + 1;
                    var $percent = (current / total) * 100;
                    $('#form_wizard_1').find('.progress-bar').css({
                        width: $percent + '%'
                    });
                }
            });

            $('#form_wizard_1').find('.button-previous').hide();
            $('#form_wizard_1 .button-submit').click(function () {
                alert('Finished! Hope you like it :)');
            }).hide();
}