<?php
require_once( dirname(__FILE__).'/form.lib.php' );

define( 'PHPFMG_USER', "bmkopp@ymail.com" ); // must be a email address. for sending password to you.
define( 'PHPFMG_PW', "935f2b" );

?>
<?php
/**
 * GNU Library or Lesser General Public License version 2.0 (LGPLv2)
*/

# main
# ------------------------------------------------------
error_reporting( E_ERROR ) ;
phpfmg_admin_main();
# ------------------------------------------------------




function phpfmg_admin_main(){
    $mod  = isset($_REQUEST['mod'])  ? $_REQUEST['mod']  : '';
    $func = isset($_REQUEST['func']) ? $_REQUEST['func'] : '';
    $function = "phpfmg_{$mod}_{$func}";
    if( !function_exists($function) ){
        phpfmg_admin_default();
        exit;
    };

    // no login required modules
    $public_modules   = false !== strpos('|captcha|', "|{$mod}|", "|ajax|");
    $public_functions = false !== strpos('|phpfmg_ajax_submit||phpfmg_mail_request_password||phpfmg_filman_download||phpfmg_image_processing||phpfmg_dd_lookup|', "|{$function}|") ;   
    if( $public_modules || $public_functions ) { 
        $function();
        exit;
    };
    
    return phpfmg_user_isLogin() ? $function() : phpfmg_admin_default();
}

function phpfmg_ajax_submit(){
    $phpfmg_send = phpfmg_sendmail( $GLOBALS['form_mail'] );
    $isHideForm  = isset($phpfmg_send['isHideForm']) ? $phpfmg_send['isHideForm'] : false;

    $response = array(
        'ok' => $isHideForm,
        'error_fields' => isset($phpfmg_send['error']) ? $phpfmg_send['error']['fields'] : '',
        'OneEntry' => isset($GLOBALS['OneEntry']) ? $GLOBALS['OneEntry'] : '',
    );
    
    @header("Content-Type:text/html; charset=$charset");
    echo "<html><body><script>
    var response = " . json_encode( $response ) . ";
    try{
        parent.fmgHandler.onResponse( response );
    }catch(E){};
    \n\n";
    echo "\n\n</script></body></html>";

}


function phpfmg_admin_default(){
    if( phpfmg_user_login() ){
        phpfmg_admin_panel();
    };
}



function phpfmg_admin_panel()
{    
    phpfmg_admin_header();
    phpfmg_writable_check();
?>    
<table cellpadding="0" cellspacing="0" border="0">
	<tr>
		<td valign=top style="padding-left:280px;">

<style type="text/css">
    .fmg_title{
        font-size: 16px;
        font-weight: bold;
        padding: 10px;
    }
    
    .fmg_sep{
        width:32px;
    }
    
    .fmg_text{
        line-height: 150%;
        vertical-align: top;
        padding-left:28px;
    }

</style>

<script type="text/javascript">
    function deleteAll(n){
        if( confirm("Are you sure you want to delete?" ) ){
            location.href = "admin.php?mod=log&func=delete&file=" + n ;
        };
        return false ;
    }
</script>


<div class="fmg_title">
    1. Email Traffics
</div>
<div class="fmg_text">
    <a href="admin.php?mod=log&func=view&file=1">view</a> &nbsp;&nbsp;
    <a href="admin.php?mod=log&func=download&file=1">download</a> &nbsp;&nbsp;
    <?php 
        if( file_exists(PHPFMG_EMAILS_LOGFILE) ){
            echo '<a href="#" onclick="return deleteAll(1);">delete all</a>';
        };
    ?>
</div>


<div class="fmg_title">
    2. Form Data
</div>
<div class="fmg_text">
    <a href="admin.php?mod=log&func=view&file=2">view</a> &nbsp;&nbsp;
    <a href="admin.php?mod=log&func=download&file=2">download</a> &nbsp;&nbsp;
    <?php 
        if( file_exists(PHPFMG_SAVE_FILE) ){
            echo '<a href="#" onclick="return deleteAll(2);">delete all</a>';
        };
    ?>
</div>

<div class="fmg_title">
    3. Form Generator
</div>
<div class="fmg_text">
    <a href="http://www.formmail-maker.com/generator.php" onclick="document.frmFormMail.submit(); return false;" title="<?php echo htmlspecialchars(PHPFMG_SUBJECT);?>">Edit Form</a> &nbsp;&nbsp;
    <a href="http://www.formmail-maker.com/generator.php" >New Form</a>
</div>
    <form name="frmFormMail" action='http://www.formmail-maker.com/generator.php' method='post' enctype='multipart/form-data'>
    <input type="hidden" name="uuid" value="<?php echo PHPFMG_ID; ?>">
    <input type="hidden" name="external_ini" value="<?php echo function_exists('phpfmg_formini') ?  phpfmg_formini() : ""; ?>">
    </form>

		</td>
	</tr>
</table>

<?php
    phpfmg_admin_footer();
}



function phpfmg_admin_header( $title = '' ){
    header( "Content-Type: text/html; charset=" . PHPFMG_CHARSET );
?>
<html>
<head>
    <title><?php echo '' == $title ? '' : $title . ' | ' ; ?>PHP FormMail Admin Panel </title>
    <meta name="keywords" content="PHP FormMail Generator, PHP HTML form, send html email with attachment, PHP web form,  Free Form, Form Builder, Form Creator, phpFormMailGen, Customized Web Forms, phpFormMailGenerator,formmail.php, formmail.pl, formMail Generator, ASP Formmail, ASP form, PHP Form, Generator, phpFormGen, phpFormGenerator, anti-spam, web hosting">
    <meta name="description" content="PHP formMail Generator - A tool to ceate ready-to-use web forms in a flash. Validating form with CAPTCHA security image, send html email with attachments, send auto response email copy, log email traffics, save and download form data in Excel. ">
    <meta name="generator" content="PHP Mail Form Generator, phpfmg.sourceforge.net">

    <style type='text/css'>
    body, td, label, div, span{
        font-family : Verdana, Arial, Helvetica, sans-serif;
        font-size : 12px;
    }
    </style>
</head>
<body  marginheight="0" marginwidth="0" leftmargin="0" topmargin="0">

<table cellspacing=0 cellpadding=0 border=0 width="100%">
    <td nowrap align=center style="background-color:#024e7b;padding:10px;font-size:18px;color:#ffffff;font-weight:bold;width:250px;" >
        Form Admin Panel
    </td>
    <td style="padding-left:30px;background-color:#86BC1B;width:100%;font-weight:bold;" >
        &nbsp;
<?php
    if( phpfmg_user_isLogin() ){
        echo '<a href="admin.php" style="color:#ffffff;">Main Menu</a> &nbsp;&nbsp;' ;
        echo '<a href="admin.php?mod=user&func=logout" style="color:#ffffff;">Logout</a>' ;
    }; 
?>
    </td>
</table>

<div style="padding-top:28px;">

<?php
    
}


function phpfmg_admin_footer(){
?>

</div>

<div style="color:#cccccc;text-decoration:none;padding:18px;font-weight:bold;">
	:: <a href="http://phpfmg.sourceforge.net" target="_blank" title="Free Mailform Maker: Create read-to-use Web Forms in a flash. Including validating form with CAPTCHA security image, send html email with attachments, send auto response email copy, log email traffics, save and download form data in Excel. " style="color:#cccccc;font-weight:bold;text-decoration:none;">PHP FormMail Generator</a> ::
</div>

</body>
</html>
<?php
}


function phpfmg_image_processing(){
    $img = new phpfmgImage();
    $img->out_processing_gif();
}


# phpfmg module : captcha
# ------------------------------------------------------
function phpfmg_captcha_get(){
    $img = new phpfmgImage();
    $img->out();
    //$_SESSION[PHPFMG_ID.'fmgCaptchCode'] = $img->text ;
    $_SESSION[ phpfmg_captcha_name() ] = $img->text ;
}



function phpfmg_captcha_generate_images(){
    for( $i = 0; $i < 50; $i ++ ){
        $file = "$i.png";
        $img = new phpfmgImage();
        $img->out($file);
        $data = base64_encode( file_get_contents($file) );
        echo "'{$img->text}' => '{$data}',\n" ;
        unlink( $file );
    };
}


function phpfmg_dd_lookup(){
    $paraOk = ( isset($_REQUEST['n']) && isset($_REQUEST['lookup']) && isset($_REQUEST['field_name']) );
    if( !$paraOk )
        return;
        
    $base64 = phpfmg_dependent_dropdown_data();
    $data = @unserialize( base64_decode($base64) );
    if( !is_array($data) ){
        return ;
    };
    
    
    foreach( $data as $field ){
        if( $field['name'] == $_REQUEST['field_name'] ){
            $nColumn = intval($_REQUEST['n']);
            $lookup  = $_REQUEST['lookup']; // $lookup is an array
            $dd      = new DependantDropdown(); 
            echo $dd->lookupFieldColumn( $field, $nColumn, $lookup );
            return;
        };
    };
    
    return;
}


function phpfmg_filman_download(){
    if( !isset($_REQUEST['filelink']) )
        return ;
        
    $info =  @unserialize(base64_decode($_REQUEST['filelink']));
    if( !isset($info['recordID']) ){
        return ;
    };
    
    $file = PHPFMG_SAVE_ATTACHMENTS_DIR . $info['recordID'] . '-' . $info['filename'];
    phpfmg_util_download( $file, $info['filename'] );
}


class phpfmgDataManager
{
    var $dataFile = '';
    var $columns = '';
    var $records = '';
    
    function phpfmgDataManager(){
        $this->dataFile = PHPFMG_SAVE_FILE; 
    }
    
    function parseFile(){
        $fp = @fopen($this->dataFile, 'rb');
        if( !$fp ) return false;
        
        $i = 0 ;
        $phpExitLine = 1; // first line is php code
        $colsLine = 2 ; // second line is column headers
        $this->columns = array();
        $this->records = array();
        $sep = chr(0x09);
        while( !feof($fp) ) { 
            $line = fgets($fp);
            $line = trim($line);
            if( empty($line) ) continue;
            $line = $this->line2display($line);
            $i ++ ;
            switch( $i ){
                case $phpExitLine:
                    continue;
                    break;
                case $colsLine :
                    $this->columns = explode($sep,$line);
                    break;
                default:
                    $this->records[] = explode( $sep, phpfmg_data2record( $line, false ) );
            };
        }; 
        fclose ($fp);
    }
    
    function displayRecords(){
        $this->parseFile();
        echo "<table border=1 style='width=95%;border-collapse: collapse;border-color:#cccccc;' >";
        echo "<tr><td>&nbsp;</td><td><b>" . join( "</b></td><td>&nbsp;<b>", $this->columns ) . "</b></td></tr>\n";
        $i = 1;
        foreach( $this->records as $r ){
            echo "<tr><td align=right>{$i}&nbsp;</td><td>" . join( "</td><td>&nbsp;", $r ) . "</td></tr>\n";
            $i++;
        };
        echo "</table>\n";
    }
    
    function line2display( $line ){
        $line = str_replace( array('"' . chr(0x09) . '"', '""'),  array(chr(0x09),'"'),  $line );
        $line = substr( $line, 1, -1 ); // chop first " and last "
        return $line;
    }
    
}
# end of class



# ------------------------------------------------------
class phpfmgImage
{
    var $im = null;
    var $width = 73 ;
    var $height = 33 ;
    var $text = '' ; 
    var $line_distance = 8;
    var $text_len = 4 ;

    function phpfmgImage( $text = '', $len = 4 ){
        $this->text_len = $len ;
        $this->text = '' == $text ? $this->uniqid( $this->text_len ) : $text ;
        $this->text = strtoupper( substr( $this->text, 0, $this->text_len ) );
    }
    
    function create(){
        $this->im = imagecreate( $this->width, $this->height );
        $bgcolor   = imagecolorallocate($this->im, 255, 255, 255);
        $textcolor = imagecolorallocate($this->im, 0, 0, 0);
        $this->drawLines();
        imagestring($this->im, 5, 20, 9, $this->text, $textcolor);
    }
    
    function drawLines(){
        $linecolor = imagecolorallocate($this->im, 210, 210, 210);
    
        //vertical lines
        for($x = 0; $x < $this->width; $x += $this->line_distance) {
          imageline($this->im, $x, 0, $x, $this->height, $linecolor);
        };
    
        //horizontal lines
        for($y = 0; $y < $this->height; $y += $this->line_distance) {
          imageline($this->im, 0, $y, $this->width, $y, $linecolor);
        };
    }
    
    function out( $filename = '' ){
        if( function_exists('imageline') ){
            $this->create();
            if( '' == $filename ) header("Content-type: image/png");
            ( '' == $filename ) ? imagepng( $this->im ) : imagepng( $this->im, $filename );
            imagedestroy( $this->im ); 
        }else{
            $this->out_predefined_image(); 
        };
    }

    function uniqid( $len = 0 ){
        $md5 = md5( uniqid(rand()) );
        return $len > 0 ? substr($md5,0,$len) : $md5 ;
    }
    
    function out_predefined_image(){
        header("Content-type: image/png");
        $data = $this->getImage(); 
        echo base64_decode($data);
    }
    
    // Use predefined captcha random images if web server doens't have GD graphics library installed  
    function getImage(){
        $images = array(
			'A0B7' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAb0lEQVR4nGNYhQEaGAYTpIn7GB0YAlhDGUNDkMRYAxhDWBsdGkSQxESmsLayNgSgiAW0ijS6AtUFILkvaum0lamhq1ZmIbkPqq4V2d7QUKBYQ8AUBhTzwHYEoIqB3OLogCoGdjOK2ECFHxUhFvcBANVezMbW9LIsAAAAAElFTkSuQmCC',
			'3113' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZklEQVR4nGNYhQEaGAYTpIn7RAMYAhimMIQ6IIkFTGEMYAhhdAhAVtnKGsAYwtAggiw2Bay3IQDJfSujVkWtmrZqaRay+1DVQc2DiIkQEAsA60V1i2gAayhjqAOKmwcq/KgIsbgPAB1SydOGWtTOAAAAAElFTkSuQmCC',
			'07FF' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYElEQVR4nGNYhQEaGAYTpIn7GB1EQ11DA0NDkMRYAxgaXYEyyOpEpmCKBbQytLIixMBOilq6atrS0JWhWUjuA6oLYMXQy+iALiYyhbUBXYw1QARDjNEBU2ygwo+KEIv7AMQeyFrVwfzYAAAAAElFTkSuQmCC',
			'5AD8' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAa0lEQVR4nGNYhQEaGAYTpIn7QkMYAlhDGaY6IIkFNDCGsDY6BASgiLG2sjYEOoggiQUGiDS6NgTA1IGdFDZt2srUVVFTs5Dd14qiDiomGuqKZl4AWB2qmMgUoBiaW1hB9qK5eaDCj4oQi/sAhWfOOJ4PqqEAAAAASUVORK5CYII=',
			'96DC' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYklEQVR4nGNYhQEaGAYTpIn7WAMYQ1hDGaYGIImJTGFtZW10CBBBEgtoFWlkbQh0YEEVawCJIbtv2tRpYUtXRWYhu4/VVbQVSR0EAs1zRRMTgIoh24HNLdjcPFDhR0WIxX0AdS7LmWSZR1oAAAAASUVORK5CYII=',
			'8C3F' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAXElEQVR4nGNYhQEaGAYTpIn7WAMYQ0EwBElMZApro2ujowOyuoBWkQaHhkAUMZEpIg0MCHVgJy2NmrZq1dSVoVlI7kNTBzePAc087HZgugXqZhSxgQo/KkIs7gMAZhLLcg+YA9QAAAAASUVORK5CYII=',
			'3F4F' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAXklEQVR4nGNYhQEaGAYTpIn7RANEQx0aHUNDkMQCpog0MLQ6OqCobAWKTUUTA6kLhIuBnbQyamrYyszM0Cxk9wHVsTZimscaGohpB5o6sFvQxEQDMMUGKvyoCLG4DwAOR8pXQi7HRwAAAABJRU5ErkJggg==',
			'7F0F' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYUlEQVR4nGNYhQEaGAYTpIn7QkNFQx2mMIaGIIu2ijQwhDI6MKCJMTo6oopNEWlgbQiEiUHcFDU1bOmqyNAsJPcxOqCoA0PWBkwxkQZMOwIaMN0CFpuC5r4BCj8qQizuAwCCQ8k0oOjRqAAAAABJRU5ErkJggg==',
			'B3A7' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaUlEQVR4nGNYhQEaGAYTpIn7QgNYQximMIaGIIkFTBFpZQhlaBBBFmtlaHR0dEAVm8LQytoQAIQI94VGrQpbuipqZRaS+6DqWhnQzHMNBcqgizUEBDCguYW1IdAB3c3oYgMVflSEWNwHAID1zgs+4iINAAAAAElFTkSuQmCC',
			'7005' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbUlEQVR4nGNYhQEaGAYTpIn7QkMZAhimMIYGIIu2MoYwhDI6oKhsZW1ldHREFZsi0ujaEOjqgOy+qGkrU1dFRkUhuY/RAaQuoEEESS9rA6aYSAPEDmSxgAaQWxgCAlDEQG5mmOowCMKPihCL+wAFF8q+dBqoRgAAAABJRU5ErkJggg==',
			'B11D' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYElEQVR4nGNYhQEaGAYTpIn7QgMYAhimMIY6IIkFTGEMYAhhdAhAFmtlDWAEiomgqAPrhYmBnRQatSpq1bSVWdOQ3IemDmoekWJQvchuCQ1gDWUMdURx80CFHxUhFvcBABpVyc6l9R43AAAAAElFTkSuQmCC',
			'5740' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcElEQVR4nGNYhQEaGAYTpIn7QkNEQx0aHVqRxQIaGIAiDlMd0MWmOgQEIIkFBjC0MgQ6OogguS9s2qppKzMzs6Yhu6+VIYC1Ea4OKsbowBoaiCIW0MoKsgXFDpEpIhCbkcRYA8BiKG4eqPCjIsTiPgDMmc05rwQzIAAAAABJRU5ErkJggg==',
			'F95A' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcElEQVR4nGNYhQEaGAYTpIn7QkMZQ1hDHVqRxQIaWFtZGximOqCIiTS6NjAEBKCLTWV0EEFyX2jU0qWpmZlZ05DcF9DAGOjQEAhTBxVjaASKhYagiLEA7UBXx9rK6OiIJsYYwhDKiCI2UOFHRYjFfQBdu8z8REN4wQAAAABJRU5ErkJggg==',
			'8F2F' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZklEQVR4nGNYhQEaGAYTpIn7WANEQx1CGUNDkMREpog0MDo6OiCrC2gVaWBtCEQRA6ljQIiBnbQ0amrYqpWZoVlI7gOra2XEMI9hChaxAEYMOxgdUMVYA4BuCUV1y0CFHxUhFvcBAMw6yUXh0QSKAAAAAElFTkSuQmCC',
			'DA37' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAb0lEQVR4nGNYhQEaGAYTpIn7QgMYAhhDGUNDkMQCpjCGsDY6NIggi7WytgJJNDGRRgegugAk90UtnbYya+qqlVlI7oOqa2VA0SsaCtQ5hQHdvIaAABSxKSKNro2ODqhuFml0DGVEERuo8KMixOI+AOxOzzlICugyAAAAAElFTkSuQmCC',
			'E66A' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaklEQVR4nGNYhQEaGAYTpIn7QkMYQxhCGVqRxQIaWFsZHR2mOqCIiTSyNjgEBKCKNbA2MDqIILkvNGpa2NKpK7OmIbkvoEG0ldXREaYObp5rQ2BoCKYYmjqQW1D1QtzMiCI2UOFHRYjFfQCRfMxrjuXFawAAAABJRU5ErkJggg==',
			'3027' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAa0lEQVR4nGNYhQEaGAYTpIn7RAMYAhhCGUNDkMQCpjCGMDo6NIggq2xlbWVtCEAVmyLS6AAUC0By38qoaSuzQBDZfSB1rQytKDa3AsWmMExhQLODAeQedLc4MDqgu5k1NBBFbKDCj4oQi/sAnjzKoGUo8e0AAAAASUVORK5CYII=',
			'077A' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcklEQVR4nGNYhQEaGAYTpIn7GB1EQ11DA1qRxVgDGBodGgKmOiCJiUwBiwUEIIkBdbUyNDo6iCC5L2rpqmmrlq7MmobkPqC6AIYpjDB1UDFGB4YAxtAQFDtYge5BVccaINIAEkUWA/HQxQYq/KgIsbgPAFEAyvOGlgy6AAAAAElFTkSuQmCC',
			'AE17' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaElEQVR4nGNYhQEaGAYTpIn7GB1EQxmmMIaGIImxBog0MIQwNIggiYlMEWlgRBMLaAXypgBpJPdFLZ0atmraqpVZSO6DqmtFtjc0FCw2hQHTvABMMUYHVDHRUMZQRxSxgQo/KkIs7gMAC/XLZ2rHlvsAAAAASUVORK5CYII=',
			'0D53' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAa0lEQVR4nGNYhQEaGAYTpIn7GB1EQ1hDHUIdkMRYA0RaWYEyAUhiIlNEGl1BNJJYQCtQbCqQRnJf1NJpK1Mzs5ZmIbkPpM4BqCoATS9ITATDDlQxkFsYHR1R3AJyM0MoA4qbByr8qAixuA8AXkbNKmimvU0AAAAASUVORK5CYII=',
			'1D5C' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAa0lEQVR4nGNYhQEaGAYTpIn7GB1EQ1hDHaYGIImxOoi0sjYwBIggiYk6iDS6AlWzoOgFik1ldEB238qsaStTMzOzkN0HUufQEOjAgKYXm5grUAzNjlZGRwdUt4SIhjCEMqC4eaDCj4oQi/sALPTJB1eUTqYAAAAASUVORK5CYII=',
			'AE82' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAa0lEQVR4nGNYhQEaGAYTpIn7GB1EQxlCGaY6IImxBog0MDo6BAQgiYlMEWlgbQh0EEESC2gFq2sQQXJf1NKpYatCgTSS+6DqGpHtCA0FmRfQyoBmHlBsCroYyC2oYiA3M4aGDILwoyLE4j4A5TTMNiZvtQAAAAAASUVORK5CYII=',
			'9ED3' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAWklEQVR4nGNYhQEaGAYTpIn7WANEQ1lDGUIdkMREpog0sDY6OgQgiQW0AsUaAhpEsIgFILlv2tSpYUtXRS3NQnIfqyuKOgjEYp4AFjFsbsHm5oEKPypCLO4DAFxhzRJ62D9ZAAAAAElFTkSuQmCC',
			'5C62' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAdUlEQVR4nGNYhQEaGAYTpIn7QkMYQxlCGaY6IIkFNLA2Ojo6BASgiIk0uDY4OoggiQUGiDSwAmkRJPeFTZu2aunUVauikN3XClTn6NCIbAdYrCGgFdktAa0gOwKmIIuJTIG4BVmMNQDkZsbQkEEQflSEWNwHAIyzzRsftDm6AAAAAElFTkSuQmCC',
			'C6A5' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcklEQVR4nGNYhQEaGAYTpIn7WEMYQximMIYGIImJtLK2MoQyOiCrC2gUaWR0dEQVaxBpYG0IdHVAcl/UqmlhS1dFRkUhuS+gQbSVFawaRW+jayiaGNAO14ZABxE0twD1BiC7D+RmoNhUh0EQflSEWNwHABptzJYCiB8fAAAAAElFTkSuQmCC',
			'42C8' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAdElEQVR4nGNYhQEaGAYTpI37pjCGMIQ6THVAFgthbWV0CAgIQBJjDBFpdG0QdBBBEmOdwgAUY4CpAztp2rRVS5euWjU1C8l9AVMYprAi1IFhaChDAGsDI4p5QLc4sKLZAdKJ7haGKaKhDuhuHqjwox7E4j4AsYnL1RL3sBsAAAAASUVORK5CYII=',
			'0F89' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaUlEQVR4nGNYhQEaGAYTpIn7GB1EQx1CGaY6IImxBog0MDo6BAQgiYlMEWlgbQh0EEESC2gFqXOEiYGdFLV0atiq0FVRYUjug6hzmIqul7UhoEEEw44AFDuwuYURpALNzQMVflSEWNwHANBqyyljxdjPAAAAAElFTkSuQmCC',
			'8E87' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAX0lEQVR4nGNYhQEaGAYTpIn7WANEQxlCGUNDkMREpog0MDo6NIggiQW0ijSwNgSgiMHUBSC5b2nU1LBVoatWZiG5D6qulQHTvClYxAIYMOxwdMDiZhSxgQo/KkIs7gMAYFHLWIURn9AAAAAASUVORK5CYII=',
			'D4D0' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZklEQVR4nGNYhQEaGAYTpIn7QgMYWllDGVqRxQKmMExlbXSY6oAs1soQytoQEBCAIsboytoQ6CCC5L6opUCwKjJrGpL7AlpFWpHUQcVEQ10xxIBuQbdjClAMzS3Y3DxQ4UdFiMV9ANM1zlqY/8N5AAAAAElFTkSuQmCC',
			'5063' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAa0lEQVR4nGNYhQEaGAYTpIn7QkMYAhhCGUIdkMQCGhhDGB0dHQJQxFhbWRscGkSQxAIDRBpdwXII94VNm7YydeqqpVnI7msFqnN0aEA2DywGFEE2L6AVZAeqmMgUTLewBmC6eaDCj4oQi/sA0lPMnCBIQC4AAAAASUVORK5CYII=',
			'6BB5' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaUlEQVR4nGNYhQEaGAYTpIn7WANEQ1hDGUMDkMREpoi0sjY6OiCrC2gRaXRtCEQVawCrc3VAcl9k1NSwpaEro6KQ3BcCNs+hQQRZbyvIvAAsYoEOIhhucQhAdh/EzQxTHQZB+FERYnEfAP76zRDsUeDRAAAAAElFTkSuQmCC',
			'C762' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAeElEQVR4nGNYhQEaGAYTpIn7WENEQx1CGaY6IImJtDI0Ojo6BAQgiQU0MjS6Njg6iCCLNTC0soLUI7kvatWqaUungmm4+4DqAlgdHRodUPQyOrA2BLQyoNjB2gAUm8KA4haRBkagW1DdDLQxlDE0ZBCEHxUhFvcBAAx6zLazRkjZAAAAAElFTkSuQmCC',
			'6F8D' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYklEQVR4nGNYhQEaGAYTpIn7WANEQx1CGUMdkMREpog0MDo6OgQgiQW0iDSwNgQ6iCCLNUDUiSC5LzJqatiq0JVZ05DcFzIFRR1EbysW87CIYXMLawBQBZqbByr8qAixuA8A67nLM+aJI7oAAAAASUVORK5CYII=',
			'AC53' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbUlEQVR4nGNYhQEaGAYTpIn7GB0YQ1lDHUIdkMRYA1gbXYEyAUhiIlNEGlxBNJJYQKtIA+tUII3kvqil01YtzcxamoXkPpA6kCpk80JDIWLo5rliiLE2Ojo6orgloJUxlAEIkd08UOFHRYjFfQADqM3wh4azjgAAAABJRU5ErkJggg==',
			'CAC1' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbElEQVR4nGNYhQEaGAYTpIn7WEMYAhhCHVqRxURaGUMYHQKmIosFNLK2sjYIhKKINYg0ujYwwPSCnRS1atrK1FWrliK7D00dVEw0FEOsEaROAM0tIo2ODgEoYqwhIo0OoQ6hAYMg/KgIsbgPABhWzUBrlQImAAAAAElFTkSuQmCC',
			'9B4C' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbElEQVR4nGNYhQEaGAYTpIn7WANEQxgaHaYGIImJTBFpZWh1CBBBEgtoFQGqcnRgQRVrZQh0dEB237SpU8NWZmZmIbuP1VWklbURrg4Cgea5hgaiiAmA7GhEtQPslkZUt2Bz80CFHxUhFvcBADnOzCtE2iriAAAAAElFTkSuQmCC',
			'D5C5' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcklEQVR4nGNYhQEaGAYTpIn7QgNEQxlCHUMDkMQCpog0MDoEOiCrC2gVaWBtEEQXC2FtYHR1QHJf1NKpS5euWhkVheS+gFaGRlcgLYKiF5uYCFBM0AFFbAprK6NDQACy+0IDGEMYQh2mOgyC8KMixOI+AEjZzUD0APRJAAAAAElFTkSuQmCC',
			'EE3D' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAUklEQVR4nGNYhQEaGAYTpIn7QkNEQxmB0AFJLKBBpIG10dEhAE2MoSHQQQRdDKhOBMl9oVFTw1ZNXZk1Dcl9aOrwm4dFDN0t2Nw8UOFHRYjFfQDz/szQL7m1gwAAAABJRU5ErkJggg==',
			'79D8' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZklEQVR4nGNYhQEaGAYTpIn7QkMZQ1hDGaY6IIu2srayNjoEBKCIiTS6NgQ6iCCLTQGJBcDUQdwUtXRp6qqoqVlI7mN0YAxEUgeGrA0MGOaJNLBgiAU0YLoloAGLmwco/KgIsbgPAIFEzVUyLosaAAAAAElFTkSuQmCC',
			'BC69' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaElEQVR4nGNYhQEaGAYTpIn7QgMYQxlCGaY6IIkFTGFtdHR0CAhAFmsVaXBtcHQQQVEn0sDawAgTAzspNGraqqVTV0WFIbkPrM7RYaoImnmsDQEN6GKuDQFodmC6BZubByr8qAixuA8AcgfOECvZl/YAAAAASUVORK5CYII=',
			'3E04' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYUlEQVR4nGNYhQEaGAYTpIn7RANEQxmmMDQEIIkFTBFpYAhlaEQWY2gVaWB0dGhFEQOqYwWqDkBy38qoqWFLV0VFRSG7D6wu0AHdPKBYaAimHdjcgiKGzc0DFX5UhFjcBwBKhs0Z5RoutwAAAABJRU5ErkJggg==',
			'E21C' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbElEQVR4nGNYhQEaGAYTpIn7QkMYQximMEwNQBILaGBtZQhhCBBBERNpdAxhdGBBEWNodJjC6IDsvtCoVUtXTVuZhew+oLopDAh1MLEATDEgfwq6Hawg3ShuCQ0RDXUMdUBx80CFHxUhFvcBAHu2y6eNG6fKAAAAAElFTkSuQmCC',
			'5B78' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAc0lEQVR4nGNYhQEaGAYTpIn7QkNEQ1hDA6Y6IIkFNIi0AsmAAFSxRoeGQAcRJLHAAKC6RgeYOrCTwqZNDVu1dNXULGT3tQLVTWFAMQ8oBtTJiGJeAFDM0QFVTGSKSCtrA6pe1gCgmxsYUNw8UOFHRYjFfQCdRMz4ycXDBAAAAABJRU5ErkJggg==',
			'3CC7' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAY0lEQVR4nGNYhQEaGAYTpIn7RAMYQxlCHUNDkMQCprA2OjoENIggq2wVaXBtEEAVmyLSwApSj+S+lVHTVi0FUlnI7oOoa2VAMw8oNgVdDGhHAAOGWwIdsLgZRWygwo+KEIv7AF4RzBH+aUBHAAAAAElFTkSuQmCC',
			'9C5F' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZklEQVR4nGNYhQEaGAYTpIn7WAMYQ1lDHUNDkMREprA2ujYwOiCrC2gVacAmxjoVLgZ20rSp01YtzcwMzUJyH6urCJAMRNHL0IopJgC2A1UM5BZHR0cUMZCbGUJR3TJQ4UdFiMV9AHaJyczpp3T5AAAAAElFTkSuQmCC',
			'F48F' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYElEQVR4nGNYhQEaGAYTpIn7QkMZWhlCGUNDkMQCGhimMjo6OjCgioWyNgSiiTG6IqkDOyk0aunSVaErQ7OQ3BfQINKKaZ5oqCuGeQytmHYwYNELdjOK2ECFHxUhFvcBAMYSyj/9QuqAAAAAAElFTkSuQmCC',
			'31DC' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAX0lEQVR4nGNYhQEaGAYTpIn7RAMYAlhDGaYGIIkFTGEMYG10CBBBVtnKGsDaEOjAgiw2hQEshuy+lVGropauisxCcR+qOqh5uMWQ7QgA6UVziyjQxehuHqjwoyLE4j4Az9nJf6qJvzUAAAAASUVORK5CYII=',
			'3395' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAa0lEQVR4nGNYhQEaGAYTpIn7RANYQxhCGUMDkMQCpoi0Mjo6OqCobGVodG0IRBWbwtDK2hDo6oDkvpVRq8JWZkZGRSG7D6iOISSgQQTNPIcGTDFHoB0iGG5xCEB2H8TNDFMdBkH4URFicR8AolfLJGXoaWcAAAAASUVORK5CYII=',
			'BE93' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAX0lEQVR4nGNYhQEaGAYTpIn7QgNEQxmA0AFJLGCKSAOjo6NDALJYq0gDa0NAgwiaOpBYAJL7QqOmhq3MjFqaheQ+kDqGELg6uHkM6OYBxRix2IHuFmxuHqjwoyLE4j4ARXrN3hqtPGYAAAAASUVORK5CYII=',
			'9C37' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZUlEQVR4nGNYhQEaGAYTpIn7WAMYQ0EwBElMZApro2ujQ4MIklhAq0iDQ0MAhhhDI0gU4b5pU6etWjV11cosJPexuoLVtaLYDNLbEDAFWUwAYkcAA4ZbHB2wuBlFbKDCj4oQi/sAqujNDa3B7E0AAAAASUVORK5CYII=',
			'3674' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAa0lEQVR4nGNYhQEaGAYTpIn7RAMYQ1hDAxoCkMQCprC2AslGZDGGVpFGoFgritgUkQaGRocpAUjuWxk1LWzV0lVRUcjumyLayjCF0QHdPIcAxtAQNDFHBwYMt7A2oIqB3YwmNlDhR0WIxX0AJybNmi9rY4oAAAAASUVORK5CYII=',
			'30F3' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYElEQVR4nGNYhQEaGAYTpIn7RAMYAlhDA0IdkMQCpjCGsDYwOgQgq2xlbWUF0iLIYlNEGl1B6pHctzJq2srU0FVLs5Ddh6oOah5ETISAHdjcAnZzAwOKmwcq/KgIsbgPAIXQy6C2mWX8AAAAAElFTkSuQmCC',
			'11E2' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZklEQVR4nGNYhQEaGAYTpIn7GB0YAlhDHaY6IImxOjAGsDYwBAQgiYk6sALFGB1E0PUCaREk963MWhW1NHTVqigk90HVNTpg6m3FcEsDwxQsYgHIYqIhrKGsoY6hIYMg/KgIsbgPABL6xnw8PCD8AAAAAElFTkSuQmCC',
			'1859' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcElEQVR4nGNYhQEaGAYTpIn7GB0YQ1hDHaY6IImxOrC2sjYwBAQgiYk6iDS6AlWLoOgFqpsKFwM7aWXWyrClmVlRYUjuA6ljaAiYiqpXpNGhIaABXcy1IQDDDkZHB1S3hDCGMIQyoLh5oMKPihCL+wAcwskO2RiR0gAAAABJRU5ErkJggg==',
			'26E6' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaklEQVR4nGNYhQEaGAYTpIn7WAMYQ1hDHaY6IImJTGFtZW1gCAhAEgtoFWlkbWB0EEDW3SrSABJDcd+0aWFLQ1emZiG7L0AUaB4jinmMDiKNriAS2S0NmGJAGzDcEhqK6eaBCj8qQizuAwDM08pdGx8kqwAAAABJRU5ErkJggg==',
			'B84F' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYElEQVR4nGNYhQEaGAYTpIn7QgMYQxgaHUNDkMQCprC2MrQ6OiCrC2gVaXSYiiYGUhcIFwM7KTRqZdjKzMzQLCT3gdSxNmKa5xoaiGkHujqQHWhiUDejiA1U+FERYnEfAEufzC4FK8O3AAAAAElFTkSuQmCC',
			'D8B5' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZElEQVR4nGNYhQEaGAYTpIn7QgMYQ1hDGUMDkMQCprC2sjY6OiCrC2gVaXRtCEQTA6tzdUByX9TSlWFLQ1dGRSG5D6LOoUEEw7wALGKBDiIYbnEIQHYfxM0MUx0GQfhREWJxHwBQbM4XSwfPwgAAAABJRU5ErkJggg==',
			'E7E8' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYUlEQVR4nGNYhQEaGAYTpIn7QkNEQ11DHaY6IIkFNDA0ujYwBARgiDE6iKCKtbIi1IGdFBq1atrS0FVTs5DcB5QPYMUwj9GBFcM81gZMMZEGdL2hIUAxNDcPVPhREWJxHwAlCMzOM3ACwQAAAABJRU5ErkJggg==',
			'489D' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaUlEQVR4nGNYhQEaGAYTpI37pjCGMIQyhjogi4WwtjI6OjoEIIkxhog0ujYEOoggibFOYW1lRYiBnTRt2sqwlZmRWdOQ3BcAVMcQgqo3NFSk0QHNPIYpIo2OGGKYbsHq5oEKP+pBLO4DAGYCyuZnEcd4AAAAAElFTkSuQmCC',
			'96EF' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAXElEQVR4nGNYhQEaGAYTpIn7WAMYQ1hDHUNDkMREprC2sjYwOiCrC2gVacQi1oAkBnbStKnTwpaGrgzNQnIfq6sohnkMQPNc0cQEsIhhcwvUzajmDVD4URFicR8AwlXIgBl2N0YAAAAASUVORK5CYII=',
			'BAC2' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAb0lEQVR4nGNYhQEaGAYTpIn7QgMYAhhCHaY6IIkFTGEMYXQICAhAFmtlbWVtEHQQQVEn0ugKpEWQ3BcaNW1lKpCOQnIfVF0jih2toqFAsVYGFDGQOoEpDGh2OALdgupmkUaHUMfQkEEQflSEWNwHANhezog7fWeqAAAAAElFTkSuQmCC',
			'4D37' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZklEQVR4nGNYhQEaGAYTpI37poiGMIYyhoYgi4WItLI2OjSIIIkxhogARQJQxFinAMXAogj3TZs2bWXW1FUrs5DcFwBR14psb2go2LwpqG4BiwWgiQHd4uiAxc2oYgMVftSDWNwHAO4TzXZ3b0wmAAAAAElFTkSuQmCC',
			'FD0A' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAX0lEQVR4nGNYhQEaGAYTpIn7QkNFQximMLQiiwU0iLQyhDJMdUAVa3R0dAgIQBNzbQh0EEFyX2jUtJWpqyKzpiG5D00dslhoCIYdjujqgG5hRBMDuRlVbKDCj4oQi/sAGnnNmvafmkwAAAAASUVORK5CYII=',
			'BF25' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAb0lEQVR4nGNYhQEaGAYTpIn7QgNEQx1CGUMDkMQCpog0MDo6OiCrC2gVaWBtCEQVA6pjaAh0dUByX2jU1LBVKzOjopDcB1bXytAggmYewxQsYgGMDiJodjA6MAQguy80AOiW0ICpDoMg/KgIsbgPAF9/zGizSL8JAAAAAElFTkSuQmCC',
			'1E06' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYklEQVR4nGNYhQEaGAYTpIn7GB1EQxmmMEx1QBJjdRBpYAhlCAhAEhMFijE6OjoIoOgVaWBtCHRAdt/KrKlhS1dFpmYhuQ+qDsU8mF4RNDGQHehiGG4JwXTzQIUfFSEW9wEALlXIRRVr/ZgAAAAASUVORK5CYII=',
			'1F49' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZklEQVR4nGNYhQEaGAYTpIn7GB1EQx0aHaY6IImxOog0MLQ6BAQgiYmCxKY6gkgkvUBeIFwM7KSVWVPDVmZmRYUhuQ+kjhVoB7pe1tCABgzzGh0w7WhEc0sIWAzFzQMVflSEWNwHAGfYygyvR8BTAAAAAElFTkSuQmCC',
			'268B' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZklEQVR4nGNYhQEaGAYTpIn7WAMYQxhCGUMdkMREprC2Mjo6OgQgiQW0ijSyNgQ6iCDrbhVpQFIHcdO0aWGrQleGZiG7L0AUwzxGB5FGVzTzWBswxUQaMN0SGorp5oEKPypCLO4DAMFVylQskzFrAAAAAElFTkSuQmCC',
			'A628' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAd0lEQVR4nGNYhQEaGAYTpIn7GB0YQxhCGaY6IImxBrC2Mjo6BAQgiYlMEWlkbQh0EEESC2gF8QJg6sBOilo6LWzVyqypWUjuC2gVbWVoZUAxLzRUpNFhCiO6eY0OAehiQLc4oOoNaGUMYQ0NQHHzQIUfFSEW9wEAzRfMJ52h8YYAAAAASUVORK5CYII=',
			'AB6C' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAa0lEQVR4nGNYhQEaGAYTpIn7GB1EQxhCGaYGIImxBoi0Mjo6BIggiYlMEWl0bXB0YEESC2gVaWUFmoDsvqilU8OWTl2Zhew+sDpHRwdke0NDQeYFoogB1YHF0O1Ad0tAK6abByr8qAixuA8AgG7L+VIJwsYAAAAASUVORK5CYII=',
			'2AE3' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaklEQVR4nGNYhQEaGAYTpIn7WAMYAlhDHUIdkMREpjCGsDYwOgQgiQW0srayguSQdbeKNLqC5JDdN23aytTQVUuzkN0XgKIODBkdRENd0cxjbYCoQxYTAYuhuiU0FCiG5uaBCj8qQizuAwAaiMxpOz7xCAAAAABJRU5ErkJggg==',
			'F339' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYElEQVR4nGNYhQEaGAYTpIn7QkNZQxhDGaY6IIkFNIi0sjY6BASgiDE0OjQEOoigirUyNDrCxMBOCo1aFbZq6qqoMCT3QdQ5TBXBMA9oE6YYmh3Y3ILp5oEKPypCLO4DAJkZzj3I+KzzAAAAAElFTkSuQmCC',
			'F7C3' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYklEQVR4nGNYhQEaGAYTpIn7QkNFQx1AEEksoIGh0dEh0CEATcy1QaBBBFWslRVCw90XGrVq2tJVq5ZmIbkPKB+ApA4qxugAEkM1jxUI0e0QAapEdwtQBZqbByr8qAixuA8AnfvOCNQuNugAAAAASUVORK5CYII=',
			'1F9D' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAXklEQVR4nGNYhQEaGAYTpIn7GB1EQx1CGUMdkMRYHUQaGB0dHQKQxESBYqwNgUASWS+KGNhJK7Omhq3MjMyahuQ+kDqGEEy9DFjMY8Qmhu6WEKAKNDcPVPhREWJxHwAL0Mgb+5XvOwAAAABJRU5ErkJggg==',
			'B192' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbUlEQVR4nGNYhQEaGAYTpIn7QgMYAhhCGaY6IIkFTGEMYHR0CAhAFmtlDWBtCHQQQVHHABQLaBBBcl9o1KqolZlAAsl9IHUMIQGNKHa0AsVAJJoYI0g1mh0gt6C6mTWUIZQxNGQQhB8VIRb3AQBYA8t2CEMqkAAAAABJRU5ErkJggg==',
			'10DA' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaElEQVR4nGNYhQEaGAYTpIn7GB0YAlhDGVqRxVgdGENYGx2mOiCJiTqwtrI2BAQEoOgVaXRtCHQQQXLfyqxpK1NXRWZNQ3IfmjpksdAQFDGQHejqQG5xRBETDQG5mRFFbKDCj4oQi/sAftDJIQvlOe8AAAAASUVORK5CYII=',
			'8FF3' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAWElEQVR4nGNYhQEaGAYTpIn7WANEQ11DA0IdkMREpog0sDYwOgQgiQW0gsSAchjqgHJI7lsaNTVsaeiqpVlI7kNTh9M83HaguoU1AKwOxc0DFX5UhFjcBwCUmsx1KB4UNgAAAABJRU5ErkJggg==',
			'1BFC' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYElEQVR4nGNYhQEaGAYTpIn7GB1EQ1hDA6YGIImxOoi0sjYwBIggiYk6iDS6AlWzoOgFqWN0QHbfyqypYUtDV2Yhuw9NHUwMbB42MUw70NwSAnRzAwOKmwcq/KgIsbgPANkYx++kyV5CAAAAAElFTkSuQmCC',
			'C99A' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcklEQVR4nGNYhQEaGAYTpIn7WEMYQxhCGVqRxURaWVsZHR2mOiCJBTSKNLo2BAQEIIs1gMQCHUSQ3Be1aunSzMzIrGlI7gtoYAx0CIGrg4oxNDo0BIaGoNjB0ujYgKoO4hZHFDGImxlRxAYq/KgIsbgPAFuNzCRWH1i5AAAAAElFTkSuQmCC',
			'0179' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAc0lEQVR4nGNYhQEaGAYTpIn7GB0YAlhDA6Y6IImxBjAGMDQEBAQgiYlMYQWKBTqIIIkFtDIEMDQ6wsTATopauipqFRCHIbkPrG4Kw1QMvUATRVDsYAgAugfFDqCtAawNDChuYXRgDQWKobh5oMKPihCL+wCogskxUHBCWwAAAABJRU5ErkJggg==',
			'A33B' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYUlEQVR4nGNYhQEaGAYTpIn7GB1YQxhDGUMdkMRYA0RaWRsdHQKQxESmMDQ6NAQ6iCCJBbQytDIg1IGdFLV0VdiqqStDs5Dch6YODENDsZqHRQzTLQGtmG4eqPCjIsTiPgCPN8zMQ12eMwAAAABJRU5ErkJggg==',
			'ECEE' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAUElEQVR4nGNYhQEaGAYTpIn7QkMYQ1lDHUMDkMQCGlgbXRsYHRhQxEQasImxIsTATgqNmrZqaejK0Cwk96GpwyuGaQemW7C5eaDCj4oQi/sA50fLJBhMz5IAAAAASUVORK5CYII=',
			'CFC5' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaElEQVR4nGNYhQEaGAYTpIn7WENEQx1CHUMDkMREWkUaGB0CHZDVBTSKNLA2CKKKNYDEGF0dkNwXtWpq2NJVK6OikNwHUQc0F0MvmhjUDmQxiFsCApDdxxoCVBHqMNVhEIQfFSEW9wEAhgbLy47YOLAAAAAASUVORK5CYII=',
			'AD46' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbklEQVR4nGNYhQEaGAYTpIn7GB1EQxgaHaY6IImxBoi0MrQ6BAQgiYlMEQGqcnQQQBILaAWKBTo6ILsvaum0lZmZmalZSO4DqXNtdEQxLzQUKBYa6CCCbl6jI7pYK9B9KHoDWjHdPFDhR0WIxX0ATkPONzczAA4AAAAASUVORK5CYII=',
			'E1BB' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAWUlEQVR4nGNYhQEaGAYTpIn7QkMYAlhDGUMdkMQCGhgDWBsdHQJQxFgDWBsCHURQxBiQ1YGdFBq1Kmpp6MrQLCT3oalDiGEzD78dUDezhqK7eaDCj4oQi/sAqFLK/EQvxqkAAAAASUVORK5CYII=',
			'B5C4' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbklEQVR4nGNYhQEaGAYTpIn7QgNEQxlCHRoCkMQCpog0MDoENKKItYo0sDYItKKpC2FtYJgSgOS+0KipS5euWhUVheS+gCkMja4gE1HMA4uFhqDaARQTQHMLaytIJ7JYaABjCLqbByr8qAixuA8ANwvPdPOrbUAAAAAASUVORK5CYII=',
			'1378' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcUlEQVR4nGNYhQEaGAYTpIn7GB1YQ1hDA6Y6IImxOoi0MjQEBAQgiYk6MDQ6NAQ6iKDoZWgFisLUgZ20MmtV2Kqlq6ZmIbkPrG4KA4p5jCDzAhjRzWt0dEAXE2llbUDVKxoCdHMDA4qbByr8qAixuA8A/WTJc+AeXNIAAAAASUVORK5CYII=',
			'8C34' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYklEQVR4nGNYhQEaGAYTpIn7WAMYQxlDGRoCkMREprA2ujY6NCKLBbSKNDgASVR1Ig0MjQ5TApDctzRq2qpVU1dFRSG5D6LO0QHdPIaGwNAQTDuwuQVFDJubByr8qAixuA8AkerPuyI0eQQAAAAASUVORK5CYII=',
			'3642' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcElEQVR4nGNYhQEaGAYTpIn7RAMYQxgaHaY6IIkFTGFtZWh1CAhAVtkq0sgw1dFBBFlsCpAX6NAgguS+lVHTwlZmZq2KQnbfFNFW1kaHRgc081xDA1oZ0MSAqqYwoLul0SEA082OoSGDIPyoCLG4DwAty8z/DDJUNwAAAABJRU5ErkJggg==',
			'04C3' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaUlEQVR4nGNYhQEaGAYTpIn7GB0YWhlCHUIdkMRYAximMjoEOgQgiYlMYQhlbRBoEEESC2hldGUF0Ujui1oKBKtWLc1Ccl9Aq0grkjqomGioK8hcVDta0e0AuqUV3S3Y3DxQ4UdFiMV9AJ+ry8tMd4CeAAAAAElFTkSuQmCC',
			'BAEE' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAXElEQVR4nGNYhQEaGAYTpIn7QgMYAlhDHUMDkMQCpjCGsDYwOiCrC2hlbcUQmyLS6IoQAzspNGraytTQlaFZSO5DUwc1TzQUUwyLOix6QwOAYmhuHqjwoyLE4j4AI9fLoPqivQgAAAAASUVORK5CYII=',
			'1854' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcklEQVR4nGNYhQEaGAYTpIn7GB0YQ1hDHRoCkMRYHVhbWRsYGpHFRB1EGl0bGFoDUPQC1U1lmBKA5L6VWSvDlmZmRUUhuQ+kjqEh0AFVr0ijQ0NgaAiamCvQJeh2MDqiuk80hDGEIZQBRWygwo+KEIv7AIM0yvJz0CtWAAAAAElFTkSuQmCC',
			'3A9C' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbklEQVR4nGNYhQEaGAYTpIn7RAMYAhhCGaYGIIkFTGEMYXR0CBBBVtnK2sraEOjAgiw2RaTRFSiG7L6VUdNWZmZGZqG4D6jOIQSuDmqeaKhDA7qYSKMjmh0BQL2OaG4RDQCah+bmgQo/KkIs7gMADpjLkyGB2BsAAAAASUVORK5CYII=',
			'477A' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcElEQVR4nGNYhQEaGAYTpI37poiGuoYGtKKIhTA0OjQETHVAEmOEiAUEIImxTmFoZWh0dBBBct+0aaumrVq6MmsakvsCpjAEMExhhKkDw9BQRgeGAMbQEBS3sDYwOqCqY5gi0gASJSg2UOFHPYjFfQCZmctFvmpqBQAAAABJRU5ErkJggg==',
			'A787' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAc0lEQVR4nM2QsRGAMAhFocgGcZ+ksKeQxhGcghTZIOcGFjKllEQt9S7QvfvAO0AfJTBS/+KHaeLEyItjgaDknCQ6FhuUWahjVKGi5cj5rYfuynpuzs9yZLnq7zJjCkINun1BjFHPoqDJ3BnY/Aj/+7Bf/C4OWMwEbMDOjQAAAABJRU5ErkJggg==',
			'7296' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAbklEQVR4nGNYhQEaGAYTpIn7QkMZQxhCGaY6IIu2srYyOjoEBKCIiTS6NgQ6CCCLTWEAi6G4L2rV0pWZkalZSO5jdACqDAlEMY+1gSGAAahXBElMBKiSEU0sAKgS3S0BDaKhDuhuHqDwoyLE4j4A8DHLR9zIj7kAAAAASUVORK5CYII=',
			'82A7' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAdUlEQVR4nGNYhQEaGAYTpIn7WAMYQximMIaGIImJTGFtZQgF0khiAa0ijY6ODihiIlMYGl0bAoAQ4b6lUauWLl0VtTILyX1AdVNYgSYwoJjHEMAaGjAFVYzRAagugAHVLQ2sDYEOqG4WDXVFExuo8KMixOI+AOIbzLJcRAQEAAAAAElFTkSuQmCC',
			'7317' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAcElEQVR4nGNYhQEaGAYTpIn7QkNZQximMIaGIIu2irQyhDA0iKCIMTQ6ootNAYpOYWgIQHZf1KqwVdNWrcxCch+jA1hdK7K9rA0MjQ5TQLoRUAQiFoAsFtAAdMsUoAkoYqwhjKGOKGIDFX5UhFjcBwDDN8sDxbHIoAAAAABJRU5ErkJggg==',
			'5CD3' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAYUlEQVR4nGNYhQEaGAYTpIn7QkMYQ1lDGUIdkMQCGlgbXRsdHQJQxEQaXMEkQiwwQKSBFSgWgOS+sGnTVi1dFbU0C9l9rSjqUMSQzQtoxbRDZAqmW1gDMN08UOFHRYjFfQBlxM6i9s4bjQAAAABJRU5ErkJggg==',
			'834F' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAZUlEQVR4nGNYhQEaGAYTpIn7WANYQxgaHUNDkMREpoi0MrQ6OiCrC2hlaHSYiiomMoWhlSEQLgZ20tKoVWErMzNDs5DcB1LH2ohpnmtoIKYdjeh2AN2CJgZ1M4rYQIUfFSEW9wEAj/HKzwEjiZQAAAAASUVORK5CYII=',
			'E120' => 'iVBORw0KGgoAAAANSUhEUgAAAEkAAAAhAgMAAADoum54AAAACVBMVEX///8AAADS0tIrj1xmAAAAaklEQVR4nGNYhQEaGAYTpIn7QkMYAhhCGVqRxQIaGAMYHR2mOqCIsQawNgQEBKCIAfU2BDqIILkvNGpV1KqVmVnTkNwHVtfKCFOHEJuCRQwI0e1gdGBAcUtoCGsoa2gAipsHKvyoCLG4DwD8bspf3HrSFwAAAABJRU5ErkJggg=='        
        );
        $this->text = array_rand( $images );
        return $images[ $this->text ] ;    
    }
    
    function out_processing_gif(){
        $image = dirname(__FILE__) . '/processing.gif';
        $base64_image = "R0lGODlhFAAUALMIAPh2AP+TMsZiALlcAKNOAOp4ANVqAP+PFv///wAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgAIACwAAAAAFAAUAAAEUxDJSau9iBDMtebTMEjehgTBJYqkiaLWOlZvGs8WDO6UIPCHw8TnAwWDEuKPcxQml0Ynj2cwYACAS7VqwWItWyuiUJB4s2AxmWxGg9bl6YQtl0cAACH5BAUKAAgALAEAAQASABIAAAROEMkpx6A4W5upENUmEQT2feFIltMJYivbvhnZ3Z1h4FMQIDodz+cL7nDEn5CH8DGZhcLtcMBEoxkqlXKVIgAAibbK9YLBYvLtHH5K0J0IACH5BAUKAAgALAEAAQASABIAAAROEMkphaA4W5upMdUmDQP2feFIltMJYivbvhnZ3V1R4BNBIDodz+cL7nDEn5CH8DGZAMAtEMBEoxkqlXKVIg4HibbK9YLBYvLtHH5K0J0IACH5BAUKAAgALAEAAQASABIAAAROEMkpjaE4W5tpKdUmCQL2feFIltMJYivbvhnZ3R0A4NMwIDodz+cL7nDEn5CH8DGZh8ONQMBEoxkqlXKVIgIBibbK9YLBYvLtHH5K0J0IACH5BAUKAAgALAEAAQASABIAAAROEMkpS6E4W5spANUmGQb2feFIltMJYivbvhnZ3d1x4JMgIDodz+cL7nDEn5CH8DGZgcBtMMBEoxkqlXKVIggEibbK9YLBYvLtHH5K0J0IACH5BAUKAAgALAEAAQASABIAAAROEMkpAaA4W5vpOdUmFQX2feFIltMJYivbvhnZ3V0Q4JNhIDodz+cL7nDEn5CH8DGZBMJNIMBEoxkqlXKVIgYDibbK9YLBYvLtHH5K0J0IACH5BAUKAAgALAEAAQASABIAAAROEMkpz6E4W5tpCNUmAQD2feFIltMJYivbvhnZ3R1B4FNRIDodz+cL7nDEn5CH8DGZg8HNYMBEoxkqlXKVIgQCibbK9YLBYvLtHH5K0J0IACH5BAkKAAgALAEAAQASABIAAAROEMkpQ6A4W5spIdUmHQf2feFIltMJYivbvhnZ3d0w4BMAIDodz+cL7nDEn5CH8DGZAsGtUMBEoxkqlXKVIgwGibbK9YLBYvLtHH5K0J0IADs=";
        $binary = is_file($image) ? join("",file($image)) : base64_decode($base64_image); 
        header("Cache-Control: post-check=0, pre-check=0, max-age=0, no-store, no-cache, must-revalidate");
        header("Pragma: no-cache");
        header("Content-type: image/gif");
        echo $binary;
    }

}
# end of class phpfmgImage
# ------------------------------------------------------
# end of module : captcha


# module user
# ------------------------------------------------------
function phpfmg_user_isLogin(){
    return ( isset($_SESSION['authenticated']) && true === $_SESSION['authenticated'] );
}


function phpfmg_user_logout(){
    session_destroy();
    header("Location: admin.php");
}

function phpfmg_user_login()
{
    if( phpfmg_user_isLogin() ){
        return true ;
    };
    
    $sErr = "" ;
    if( 'Y' == $_POST['formmail_submit'] ){
        if(
            defined( 'PHPFMG_USER' ) && strtolower(PHPFMG_USER) == strtolower($_POST['Username']) &&
            defined( 'PHPFMG_PW' )   && strtolower(PHPFMG_PW) == strtolower($_POST['Password']) 
        ){
             $_SESSION['authenticated'] = true ;
             return true ;
             
        }else{
            $sErr = 'Login failed. Please try again.';
        }
    };
    
    // show login form 
    phpfmg_admin_header();
?>
<form name="frmFormMail" action="" method='post' enctype='multipart/form-data'>
<input type='hidden' name='formmail_submit' value='Y'>
<br><br><br>

<center>
<div style="width:380px;height:260px;">
<fieldset style="padding:18px;" >
<table cellspacing='3' cellpadding='3' border='0' >
	<tr>
		<td class="form_field" valign='top' align='right'>Email :</td>
		<td class="form_text">
            <input type="text" name="Username"  value="<?php echo $_POST['Username']; ?>" class='text_box' >
		</td>
	</tr>

	<tr>
		<td class="form_field" valign='top' align='right'>Password :</td>
		<td class="form_text">
            <input type="password" name="Password"  value="" class='text_box'>
		</td>
	</tr>

	<tr><td colspan=3 align='center'>
        <input type='submit' value='Login'><br><br>
        <?php if( $sErr ) echo "<span style='color:red;font-weight:bold;'>{$sErr}</span><br><br>\n"; ?>
        <a href="admin.php?mod=mail&func=request_password">I forgot my password</a>   
    </td></tr>
</table>
</fieldset>
</div>
<script type="text/javascript">
    document.frmFormMail.Username.focus();
</script>
</form>
<?php
    phpfmg_admin_footer();
}


function phpfmg_mail_request_password(){
    $sErr = '';
    if( $_POST['formmail_submit'] == 'Y' ){
        if( strtoupper(trim($_POST['Username'])) == strtoupper(trim(PHPFMG_USER)) ){
            phpfmg_mail_password();
            exit;
        }else{
            $sErr = "Failed to verify your email.";
        };
    };
    
    $n1 = strpos(PHPFMG_USER,'@');
    $n2 = strrpos(PHPFMG_USER,'.');
    $email = substr(PHPFMG_USER,0,1) . str_repeat('*',$n1-1) . 
            '@' . substr(PHPFMG_USER,$n1+1,1) . str_repeat('*',$n2-$n1-2) . 
            '.' . substr(PHPFMG_USER,$n2+1,1) . str_repeat('*',strlen(PHPFMG_USER)-$n2-2) ;


    phpfmg_admin_header("Request Password of Email Form Admin Panel");
?>
<form name="frmRequestPassword" action="admin.php?mod=mail&func=request_password" method='post' enctype='multipart/form-data'>
<input type='hidden' name='formmail_submit' value='Y'>
<br><br><br>

<center>
<div style="width:580px;height:260px;text-align:left;">
<fieldset style="padding:18px;" >
<legend>Request Password</legend>
Enter Email Address <b><?php echo strtoupper($email) ;?></b>:<br />
<input type="text" name="Username"  value="<?php echo $_POST['Username']; ?>" style="width:380px;">
<input type='submit' value='Verify'><br>
The password will be sent to this email address. 
<?php if( $sErr ) echo "<br /><br /><span style='color:red;font-weight:bold;'>{$sErr}</span><br><br>\n"; ?>
</fieldset>
</div>
<script type="text/javascript">
    document.frmRequestPassword.Username.focus();
</script>
</form>
<?php
    phpfmg_admin_footer();    
}


function phpfmg_mail_password(){
    phpfmg_admin_header();
    if( defined( 'PHPFMG_USER' ) && defined( 'PHPFMG_PW' ) ){
        $body = "Here is the password for your form admin panel:\n\nUsername: " . PHPFMG_USER . "\nPassword: " . PHPFMG_PW . "\n\n" ;
        if( 'html' == PHPFMG_MAIL_TYPE )
            $body = nl2br($body);
        mailAttachments( PHPFMG_USER, "Password for Your Form Admin Panel", $body, PHPFMG_USER, 'You', "You <" . PHPFMG_USER . ">" );
        echo "<center>Your password has been sent.<br><br><a href='admin.php'>Click here to login again</a></center>";
    };   
    phpfmg_admin_footer();
}


function phpfmg_writable_check(){
 
    if( is_writable( dirname(PHPFMG_SAVE_FILE) ) && is_writable( dirname(PHPFMG_EMAILS_LOGFILE) )  ){
        return ;
    };
?>
<style type="text/css">
    .fmg_warning{
        background-color: #F4F6E5;
        border: 1px dashed #ff0000;
        padding: 16px;
        color : black;
        margin: 10px;
        line-height: 180%;
        width:80%;
    }
    
    .fmg_warning_title{
        font-weight: bold;
    }

</style>
<br><br>
<div class="fmg_warning">
    <div class="fmg_warning_title">Your form data or email traffic log is NOT saving.</div>
    The form data (<?php echo PHPFMG_SAVE_FILE ?>) and email traffic log (<?php echo PHPFMG_EMAILS_LOGFILE?>) will be created automatically when the form is submitted. 
    However, the script doesn't have writable permission to create those files. In order to save your valuable information, please set the directory to writable.
     If you don't know how to do it, please ask for help from your web Administrator or Technical Support of your hosting company.   
</div>
<br><br>
<?php
}


function phpfmg_log_view(){
    $n = isset($_REQUEST['file'])  ? $_REQUEST['file']  : '';
    $files = array(
        1 => PHPFMG_EMAILS_LOGFILE,
        2 => PHPFMG_SAVE_FILE,
    );
    
    phpfmg_admin_header();
   
    $file = $files[$n];
    if( is_file($file) ){
        if( 1== $n ){
            echo "<pre>\n";
            echo join("",file($file) );
            echo "</pre>\n";
        }else{
            $man = new phpfmgDataManager();
            $man->displayRecords();
        };
     

    }else{
        echo "<b>No form data found.</b>";
    };
    phpfmg_admin_footer();
}


function phpfmg_log_download(){
    $n = isset($_REQUEST['file'])  ? $_REQUEST['file']  : '';
    $files = array(
        1 => PHPFMG_EMAILS_LOGFILE,
        2 => PHPFMG_SAVE_FILE,
    );

    $file = $files[$n];
    if( is_file($file) ){
        phpfmg_util_download( $file, PHPFMG_SAVE_FILE == $file ? 'form-data.csv' : 'email-traffics.txt', true, 1 ); // skip the first line
    }else{
        phpfmg_admin_header();
        echo "<b>No email traffic log found.</b>";
        phpfmg_admin_footer();
    };

}


function phpfmg_log_delete(){
    $n = isset($_REQUEST['file'])  ? $_REQUEST['file']  : '';
    $files = array(
        1 => PHPFMG_EMAILS_LOGFILE,
        2 => PHPFMG_SAVE_FILE,
    );
    phpfmg_admin_header();

    $file = $files[$n];
    if( is_file($file) ){
        echo unlink($file) ? "It has been deleted!" : "Failed to delete!" ;
    };
    phpfmg_admin_footer();
}


function phpfmg_util_download($file, $filename='', $toCSV = false, $skipN = 0 ){
    if (!is_file($file)) return false ;

    set_time_limit(0);


    $buffer = "";
    $i = 0 ;
    $fp = @fopen($file, 'rb');
    while( !feof($fp)) { 
        $i ++ ;
        $line = fgets($fp);
        if($i > $skipN){ // skip lines
            if( $toCSV ){ 
              $line = str_replace( chr(0x09), ',', $line );
              $buffer .= phpfmg_data2record( $line, false );
            }else{
                $buffer .= $line;
            };
        }; 
    }; 
    fclose ($fp);
  

    
    /*
        If the Content-Length is NOT THE SAME SIZE as the real conent output, Windows+IIS might be hung!!
    */
    $len = strlen($buffer);
    $filename = basename( '' == $filename ? $file : $filename );
    $file_extension = strtolower(substr(strrchr($filename,"."),1));

    switch( $file_extension ) {
        case "pdf": $ctype="application/pdf"; break;
        case "exe": $ctype="application/octet-stream"; break;
        case "zip": $ctype="application/zip"; break;
        case "doc": $ctype="application/msword"; break;
        case "xls": $ctype="application/vnd.ms-excel"; break;
        case "ppt": $ctype="application/vnd.ms-powerpoint"; break;
        case "gif": $ctype="image/gif"; break;
        case "png": $ctype="image/png"; break;
        case "jpeg":
        case "jpg": $ctype="image/jpg"; break;
        case "mp3": $ctype="audio/mpeg"; break;
        case "wav": $ctype="audio/x-wav"; break;
        case "mpeg":
        case "mpg":
        case "mpe": $ctype="video/mpeg"; break;
        case "mov": $ctype="video/quicktime"; break;
        case "avi": $ctype="video/x-msvideo"; break;
        //The following are for extensions that shouldn't be downloaded (sensitive stuff, like php files)
        case "php":
        case "htm":
        case "html": 
                $ctype="text/plain"; break;
        default: 
            $ctype="application/x-download";
    }
                                            

    //Begin writing headers
    header("Pragma: public");
    header("Expires: 0");
    header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
    header("Cache-Control: public"); 
    header("Content-Description: File Transfer");
    //Use the switch-generated Content-Type
    header("Content-Type: $ctype");
    //Force the download
    header("Content-Disposition: attachment; filename=".$filename.";" );
    header("Content-Transfer-Encoding: binary");
    header("Content-Length: ".$len);
    
    while (@ob_end_clean()); // no output buffering !
    flush();
    echo $buffer ;
    
    return true;
 
    
}
?>