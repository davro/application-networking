<?php
namespace Applications\Networking;

use Library\Application\Actions as Actions;
use Library\Application\View;

/**
 * Application Networking.
 * 
 * Network based Drawing Image application using node, js, css, html canvas.
 * 
 * @author David Stevens.
 * 
 */
class Networking extends Actions {

	const headerHeading = 'Networking with a Twist.';
	
	const headerTagline = 'Network theory is an area of computer science and network science and part of graph theory.';

	/**
	 * Framework context creation.
	 */
	public function __construct() {
		
		parent::__construct();
		
	} // end function __construct
	
	/**
	 * View control method.
	 * 
	 * @layout _layout-fluid
	 * @navigation build
	 */
	public function executeIndex() {

		$this->headerHeading = self::headerHeading;
		$this->headerTagline = self::headerTagline;
		
		return View::SUCCESS;
		
	} // end function executeIndex
	
	/**
	 * View control method.
	 * 
	 * @navigation build
	 * @layout _layout-draw
	 */
	public function executeDraw() {

		$this->headerHeading = 'Draw with others!';
		$this->headerTagline = 'Drawing is a form of visual art that makes use of any number of drawing instruments to mark a medium.';
		
		return View::SUCCESS;
		
	} // end function executeDraw
	
	/**
	 * View control method for the image sharing and saving.
	 * 
	 * @navigation build
	 * @layout _layout-image
	 */
	public function executeImage() {

		$this->headerHeading = 'Image share, just drag and drop!';
		$this->headerTagline = 'Just drag and drop images from your computer on to this website. Press and hold SHIFT key to drag out the image on your hard disk i.e. on your desktop. If drag out does not work on your browser you can right click on the image and save it on your computer';
		
		return View::SUCCESS;
		
	} // end function executeImage

	/**
	 * View control method.
	 * 
	 * @navigation build
	 * @layout _layout-video
	 */
	public function executeVideo() {

		$this->headerHeading = 'Video with others!';
		$this->headerTagline = 'HTML5 video tag experiment, way of the future.';
		
		return View::SUCCESS;
		
	} // end function executeVideo	

	/**
	 * Chronological control.
	 * 
	 * Methods prefixed with cron will be executed by the framemwork when the 
	 * system cron is run, annotation for running services.
	 * 
	 * @service node 
	 * @command /applications/Networking/node/application.js
	 */
	public function cronNetworking() {	
		
		return true;
		
	} // end function cronNetworking
	
	/**
	 * Chronological control.
	 * 
	 * Methods prefixed with cron will be executed by the framemwork when the 
	 * system cron is run, annotation for running services and system commands.
	 * 
	 * @service system
	 * @command cd applications/Networking && /usr/bin/git pull 
	 */
	public function cronGit() {	
		
		return true;
		
	} // end function cronGit
	
} // end class Drawing
