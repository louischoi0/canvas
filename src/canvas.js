import React, { Component } from 'react';
import math from "mathjs";
import _ from "lodash";

const CWIDTH = 800
const CHEIGHT = 480
const CORE = new Point([CWIDTH / 2, CHEIGHT / 2]);
const CCORE = new Point(cpos(CORE));

const XAXIS_LEN = 300;
const YAXIS_LEN = 300;
const ZAXIS_LEN = 1700 * 28;

const CONVZ = math.matrix([[1,0],[0,1],[-0.009,0.017]]);
const CONVX = math.matrix([[1,0.3], [0,0.97], [0, 0 ]]);

function Vec3(x,y,z){
  this.x = x;
  this.y = y;
  this.z = z;
}

function Point(x,y){
    if( x instanceof Array ){
      this.x = x[0];
      this.y = x[1];
      this.X = x[0];
      this.Y = x[1];
      this.v = [ x[0], x[1] ];
      this.m = [this.v];
    }

    else{
      this.x = x;
      this.y = y;
      this.X = x;
      this.Y = y;
      this.v = [x,y];
      this.m = [this.v];
    }
}


function getProjMx(onto){
  var temp = math.matrix(onto);
  var tOnto = math.transpose(temp);

  temp = math.multiply(tOnto, onto);
  var temp2 = _.flatten(onto);
  temp2 = math.dot(temp2, temp2);

  return math.matrix(math.multiply(temp, 1 / temp2));
}

function cpos(pos){
  if(pos instanceof Array) {
    return new Point(pos[0], CHEIGHT - pos[1]);
  }

  return new Point( pos.x , CHEIGHT - pos.y);
};

function rvector(ctx, pos, colour){
  var tpos = cpos(pos);
  rrvector(ctx, tpos, colour);
}


function rline(ctx, start, end,colour){
  ctx.beginPath();
  ctx.moveTo(start.x,start.y);
  ctx.lineTo(end.x, end.y);
  if(colour) ctx.strokeStyle = colour;
  ctx.stroke();
}

function rrvector(ctx,tpos, colour){
  initCtx(ctx);

  var o = new Point(0,0);
  o = cpos(o);

  ctx.lineTo(o.x, o.y);
  ctx.lineTo(tpos.x, tpos.y);
  if(colour)  ctx.strokeStyle = colour;
  ctx.stroke();
}

function initCtx(ctx){
  ctx.beginPath();
}

function rrdot(ctx, cpos, radius){
  initCtx(ctx);
  ctx.arc(cpos.x , cpos.y, radius, 0,Math.PI * 2, true);
  ctx.fill();
}

function rdot(ctx, pos, radius){
  var tpos = cpos(pos);
  rrdot(ctx, cpos, radius);
}

function matrixToPoint(mx){
  var v;

  if( mx._size.length > 1 ) {
    v = _.flatten(mx._data);
  }
  else {
    v = mx._data;
  }
  return new Point(v);

}

function initAxis(ctx){
  var xstart = new Point(CORE.X - (XAXIS_LEN / 2), CORE.Y);
  var xend = new Point(CORE.X + (XAXIS_LEN / 2), CORE.Y);
  var ystart = new Point(CORE.X, CORE.Y - (YAXIS_LEN / 2));
  var yend = new Point(CORE.X, CORE.Y + (YAXIS_LEN / 2));

  var zstart = math.matrix([[CORE.X, CORE.Y, ZAXIS_LEN]]);
  var zend = math.matrix([[CORE.X, CORE.Y, -ZAXIS_LEN]]);

  var xstartm = math.matrix([[CORE.X - (XAXIS_LEN / 2), CORE.Y, 0]]);
  var xendm = math.matrix([[CORE.X + (XAXIS_LEN / 2), CORE.Y, 0]]);

  xstartm = math.multiply(xstartm, CONVX);
  xendm = math.multiply (xendm , CONVX);

  zstart = math.multiply(zstart, CONVZ);
  zend = math.multiply(zend, CONVZ);

  zstart = matrixToPoint(zstart);
  zend = matrixToPoint(zend);

  xstartm = matrixToPoint(xstartm);
  xendm = matrixToPoint(xendm);

  console.log(xstartm);
  console.log(xendm);

//  rline(ctx, zstart, zend);
//  rline(ctx, ystart, yend);
  rline(ctx, xstartm, xendm);

}

function batchDot(ctx){
  var dot = new Point(10, 20);
  rdot(ctx, dot, 20);
}

class Canvas extends Component {
  constructor(props){
    super(props);
    this.angle = 0;

  }

  componentDidMount(){
    var canvas = document.getElementById("canv");
    if(canvas.getContext){
      var ctx = canvas.getContext("2d");
      this.ctx = ctx;
    }

    else{
      console.log("Not supported");
    }

    rrdot(this.ctx, CCORE, 5);
    initAxis(this.ctx);
    batchDot(this.ctx);

    var proj = getProjMx([[100,200]]);
    var t = math.matrix([[30],[200]]);
    var res = math.multiply(proj, t);
  }

  render(){
    return (<div>
              <canvas id="canv" width={CWIDTH} height={CHEIGHT} ></canvas>
            </div>)
  }

}

export default Canvas;
