import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"
import styled from "styled-components";
import { useSelector } from 'react-redux';
// import logosample from "../../assets/logosample.png"

const Container = styled.div`    
  width: 100%;
  max-width: 70%;
  border: 1px solid grey;
  border-radius: 8px;
`;

const SGridDiv = styled.div`
  display: grid;
  grid-template-columns: 0.6fr 0.4fr;
  grid-template-areas:
    "div div";
`;

const SPicLeftDiv = styled.div`
  width: 100%;
  max-width: 100%;
  height: 50vh;
  max-height: 100%;
  overflow: hidden;
`;

const SPicRightDiv = styled.div`
  width: 100%;
  max-width: 100%;
  height: 50vh;
  max-height: 100%;
  overflow: hidden;
`;

const SPicDiv = styled.div`
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 85%;
  border: 1px solid grey;
  border-radius: 8px;
`;

const SPicsDiv = styled.div`
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 15%;
  border: 1px solid grey;
  border-radius: 8px;
`;

const SBroadcastDiv = styled.div`
  width: 100%;
  max-width: 100%;
  height: 50%;
  max-height: 50%;
  border: 1px solid grey;
  border-radius: 8px;
`;

const SMapDiv = styled.div`
  width: 100%;
  max-width: 100%;
  height: 50%;
  max-height: 50%;
  border: 1px solid grey;
  border-radius: 8px;
`;

const SInfoDiv = styled.div`
  display: grid;
  grid-template-areas:
    "div div div div"
`;

const SPTag = styled.p`
  border: 1px solid grey;
  border-radius: 8px;
`;

const Sbutton = styled.button`
  float: right;
  margin-top: 5px;
  border-radius: 8px;
  border: 0.5px solid lightgrey;
  background-color: rgba(255, 17, 0, 0.2);

  :hover {
    border: 1px solid black;
  }
`;

// const ImgTag = styled.img`
//   width: 100%;
//   height: 100%;
//   object-fit: contain;
// `;

function ItemDetail() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  }
  const { itemDetail } = useSelector((state) => state.itemSlice);

  useEffect(() => {
    // 마커
    var marker = [
      {
          position: new window.kakao.maps.LatLng(itemDetail.item_lng, itemDetail.item_lat), 
          text: itemDetail.item_title
      }
    ];

    // 카카오 지도
    var mapContainer  = document.getElementById('map')
    var options = {
      center: new window.kakao.maps.LatLng(itemDetail.item_lng, itemDetail.item_lat), 
      level: 5,
      marker: marker
    };
    var map = new window.kakao.maps.StaticMap(mapContainer, options)




    // 카카오 로드뷰
    var roadviewContainer = document.getElementById('roadview'); 
    var roadview = new window.kakao.maps.Roadview(roadviewContainer); 
    var roadviewClient = new window.kakao.maps.RoadviewClient(); 

    var position = new window.kakao.maps.LatLng(itemDetail.item_lng, itemDetail.item_lat);

    roadviewClient.getNearestPanoId(position, 50, function(panoId) {
      roadview.setPanoId(panoId, position); 
    });

  }, [])

  return (
    <div style={{justifyContent: 'center', display: 'flex'}}>
      <Container>
        <SGridDiv>
          <SPicLeftDiv>
            <SPicDiv id="roadview">
            </SPicDiv>
            <SPicsDiv>
              <h1>{itemDetail.item_title}</h1>
            </SPicsDiv>
          </SPicLeftDiv>
          <SPicRightDiv>
            <SBroadcastDiv>
              <h1>방송정보</h1>
              {/* <ImgTag src={logosample} alt="이미지" /> */}
            </SBroadcastDiv>
            <SMapDiv id="map">
            </SMapDiv>
          </SPicRightDiv>
        </SGridDiv>
        
        <h1>매물 상세 정보</h1>
        <SInfoDiv>
          <SPTag>매물이름: {itemDetail.item_title}</SPTag>
          <SPTag>매물종류: {itemDetail.item_deal_type === 0 ? '월세' : itemDetail.item_deal_type === 1 ? '전세' : '매매'}</SPTag>
          <SPTag>건물유형: {itemDetail.item_building_type === 0 ? '원룸' : itemDetail.item_building_type === 1 ? '투,쓰리룸' : itemDetail.item_building_type === 2 ? '오피스텔' : '아파트'}</SPTag>
          <SPTag>관리비용: {itemDetail.item_manage_fee}</SPTag>
        </SInfoDiv>
        <SInfoDiv>
          <SPTag>위치: {itemDetail.item_dong}</SPTag>
          <SPTag>
            공급면적: {itemDetail.item_supply_area} &nbsp;&nbsp;
            전용면적: {itemDetail.item_exclusive_area}
          </SPTag>
          <SPTag>
            방: {itemDetail.item_room} &nbsp;&nbsp;
            화장실: {itemDetail.item_toilet}
          </SPTag>
        </SInfoDiv>
        <SInfoDiv>
          <SPTag>
            총 층수: {itemDetail.item_total_floor} &nbsp;&nbsp;
            해당 층: {itemDetail.item_floor}
          </SPTag>
          <SPTag>
            {itemDetail.item_move_in_type === 0 ? '즉시 입주 가능' : `입주 가능일 : ${itemDetail.item_move_in_date}`}
          </SPTag>
        </SInfoDiv>
        <Sbutton onClick={goBack}>뒤로가기</Sbutton>
      </Container>
    </div>
  )
}

export default ItemDetail;