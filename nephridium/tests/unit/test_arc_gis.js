const chai = require('chai');
const arc_gis = require('../../arc_gis.js');

const { expect } = chai;

describe('transform', () => {
  it('transforms arc gis data', () => {
    const data = [{
      exceededTransferLimit:true,
      features:[
        {
          attributes:{
            OBJECTID:1,
            SERVICE_NUMBER:4041371,
            REQUEST_DATE:1420156800000,
            REGEX:"514 THOMAS AVE ",
            WARD:"1",
            DISTRICT_COUNCIL:7,
            STATUS:"Resolved",
            REQUEST_TYPE:"Complaint",
            REQUEST_DESCRIPTION:"Snow Walk",
            SEE_CLICK_FIX_SITE:"No",
            LATITUE:"44.95922482",
            LONGITUTE:"-93.12176762",
            MAP_LOCATION:"(44.95922482,-93.12176762)",
            COUNT_:1,
            PROPX:567713.4009,
            PROPY:161405.7836
          },
          geometry:{
            x:-93.121767624634742,
            y:44.959224815911639
          }
        },
        {
          attributes:{
            OBJECTID:2,
            SERVICE_NUMBER:4041373,
            REQUEST_DATE:1420156800000,
            REGEX:"468 THOMAS AVE ",
            WARD:"1",
            DISTRICT_COUNCIL:7,
            STATUS:"Resolved",
            REQUEST_TYPE:"Complaint",
            REQUEST_DESCRIPTION:"Snow Walk",
            SEE_CLICK_FIX_SITE:"No",
            LATITUE:"44.95921912",
            LONGITUTE:"-93.11997635",
            MAP_LOCATION:"(44.95921912,-93.11997635)",
            COUNT_:1,
            PROPX:568177.1259,
            PROPY:161405.2088
          },
          geometry:{
            x:-93.119976350698465,
            y:44.959219119314369
          }
        }
      ]
    }];

    const ret = arc_gis.transform(data);

    expect(ret.length).to.equal(2);
    expect(ret[0]['SERVICE_NUMBER']).to.equal(4041371);
    expect(ret[1]['SERVICE_NUMBER']).to.equal(4041373);
  });
});
