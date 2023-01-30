package com.bangbang.service;

import com.bangbang.domain.item.*;

import com.bangbang.dto.item.ItemPriceSaveRequestDto;
import com.bangbang.dto.item.ItemSaveRequestDto;
import com.bangbang.dto.item.ManageOptionSaveRequestDto;
import com.bangbang.dto.item.OptionSaveRequestDto;
import java.util.List;
import javax.transaction.Transactional;

import com.bangbang.domain.item.Item;
import com.bangbang.domain.item.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ItemServiceImpl implements ItemService {

    @Autowired
    private ItemRepository itemRepository;
    @Autowired
    private OptionRepository optionRepository;
    @Autowired
    private ManageOptionRepository manageOptionRepository;
    @Autowired
    private ItemPriceRepository itemPriceRepository;

    @Transactional
    @Override
    public long newItem(ItemSaveRequestDto item) {
        return itemRepository.save(item.toEntity()).getItem_id();
    }

    @Transactional
    @Override
    public void newOption(OptionSaveRequestDto option, long item_id) {
        option.setItem_id(item_id);
        optionRepository.save(option.toEntity());
    }

    @Transactional
    @Override
    public void newManageOption(ManageOptionSaveRequestDto manageOption, long item_id) {
        manageOption.setItem_id(item_id);
        manageOptionRepository.save(manageOption.toEntity());
    }

    @Transactional
    @Override
    public void newItemPrice(ItemPriceSaveRequestDto itemPrice, long item_id) {
        itemPrice.setItem_id(item_id);
        itemPriceRepository.save(itemPrice.toEntity());
    }

    @Override
    public List<Item> searchItemAll() {
        return itemRepository.findTop100By();
    }

    @Override
    public List<Item> searchItemFilter() {
        return null;
    }

    @Override
    public Item itemDetail(long itemId) {
        return itemRepository.findById(itemId);
    }

    @Transactional
    @Override
    public void deactivateItem(long itemId) {
        Item item =  itemRepository.findById(itemId);
        item.setItem_status(1);
        itemRepository.save(item);
    }

    @Transactional
    @Override
    public void modifyItem(Item item) {
        itemRepository.save(item);
    }

    @Transactional
    @Override
    public void itemSold(long itemId) {
        Item item = itemRepository.findById(itemId);
        item.setItem_deal_complete(true);
        itemRepository.save(item);
    }
}