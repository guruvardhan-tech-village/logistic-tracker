package com.logistics.fleet.mapper;

import com.logistics.fleet.model.dto.UserDto;
import com.logistics.fleet.model.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
    User toEntity(UserDto userDto);
}
