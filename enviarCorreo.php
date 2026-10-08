<?php
	$tipoMensaje = $_POST['tipoMensaje'];
	$NombreContacto = $_POST['NombreContacto'];
	$EmailContacto = $_POST['EmailContacto'];
	$EmailPlaza = $_POST['EmailPlaza'];
	$NombrePlaza = $_POST['NombrePlaza'];
	$TelefonoContacto = $_POST['TelefonoContacto'];
	$Mensaje = $_POST['Mensaje'];
	include("../00-gestorContenidos/class/conexionCorreos.php");
?>