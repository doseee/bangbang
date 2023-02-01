package com.bangbang.dto.broadcast;

import com.bangbang.domain.broadcast.Broadcast;
import com.bangbang.domain.image.Image;
import com.bangbang.domain.item.Item;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class BroadcastSaveRequestDto {
  private Long broadcastId;
  private String broadcastDescription;
  private String broadcastTitle;

//  private Item item;
  private Long imageId;
  @Builder
  public BroadcastSaveRequestDto(String broadcastDescription, String broadcastTitle, Long imageId){
    this.broadcastDescription = broadcastDescription;
    this.broadcastTitle = broadcastTitle;
    this.imageId = imageId;
  }

//  public void setItem(Item item){this.item = item;}
//  public void setImage(Image image){this.image = image;}

  public Broadcast toEntity(Image image){
    return Broadcast.builder()
        .broadcastId(broadcastId)
        .broadcastDescription(broadcastDescription)
        .broadcastStatus(1)
        .broadcastTitle(broadcastTitle)
//        .item(item)
        .image(image)
        .build();
  }

}
